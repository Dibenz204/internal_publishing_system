<?php

namespace App\Services;

use App\Models\Report;
use App\Models\Department;

class ReportService
{
    private function filterByDateRange($query, $fromMonth, $fromYear, $toMonth, $toYear)
    {
        return $query->where(function ($q) use ($fromMonth, $fromYear, $toMonth, $toYear) {

            $q->where(function ($sub) use ($fromMonth, $fromYear) {
                $sub->where('report_year', '>', $fromYear)
                    ->orWhere(function ($s) use ($fromMonth, $fromYear) {
                        $s->where('report_year', $fromYear)
                          ->where('report_month', '>=', $fromMonth);
                    });
            });

        })->where(function ($q) use ($toMonth, $toYear) {

            $q->where(function ($sub) use ($toMonth, $toYear) {
                $sub->where('report_year', '<', $toYear)
                    ->orWhere(function ($s) use ($toMonth, $toYear) {
                        $s->where('report_year', $toYear)
                          ->where('report_month', '<=', $toMonth);
                    });
            });

        });
    }

    private function applyOptionalDateFilter($query, ?int $fromMonth, ?int $fromYear, ?int $toMonth, ?int $toYear)
    {
        if ($fromMonth !== null && $fromYear !== null && $toMonth !== null && $toYear !== null) {
            return $this->filterByDateRange($query, $fromMonth, $fromYear, $toMonth, $toYear);
        }
        return $query;
    }

    private function mapReportRow(Report $report, int $index): array
    {
        $book = $report->project?->book;
        $paper = $book?->paper;
        $jobCategory = $report->allocation?->jobCategory;

        return [
            'index' => $index,
            'book_name' => $book?->name ?? '',
            'page_count' => $book?->page !== null ? (string) $book->page : '',
            'paper_size' => $paper?->paperSize ?? '',
            'type' => '',
            'publishing' => '',
            'paper_coefficient' => $paper?->paper_coefficient !== null ? (string) $paper->paper_coefficient : '',
            'converted_pages' => $paper?->paper_coefficient !== null && $book?->page !== null ? (string) round($paper->paper_coefficient * $book->page, 2) : '',
            'editing_coefficient' => 0.25, // HS BT sẽ thống nhất sau khi HS có lúc 0.25, 1, 0.6, ..
            'proofreading_coefficient' => 0.02,
            'correction_coefficient' => 0.03,
            'actual_pages' => $this->getActualPages($report->allocation),
            'department' => $report->project?->department?->name ?? '',
            'approved_pages' => $report->conversion_page !== null ? (string) $report->conversion_page : '',
            'salary' => $report->salary !== null ? number_format((float) $report->salary, 2, '.', '') : '',
            'employeeName' => $report->allocation?->employee?->name ?? '',
        ];
    }

    /**
     * Lấy số trang thực hiện từ allocation.completed_page, phân theo loại công việc.
     */
    private function getActualPages($allocation): array
    {
        $proofreading = '';
        $correction = '';
        $editing = '';

        if ($allocation && $allocation->completed_page !== null) {
            $name = mb_strtolower($allocation->jobCategory?->name ?? '');
            $pages = (string) $allocation->completed_page;

            if (str_contains($name, 'biên tập')) {
                $editing = $pages;
            } elseif (str_contains($name, 'đọc đính chính')) {
                $proofreading = $pages;
            } elseif (str_contains($name, 'sửa bài')) {
                $correction = $pages;
            }
        }

        return [
            'proofreading' => $proofreading,
            'correction' => $correction,
            'editing' => $editing,
        ];
    }

    /**
     * Tính tổng số trang thực hiện + tổng trang quyết định + tổng tiền từ một nhóm reports.
     */
    private function sumReportTotals($reports): array
    {
        $totalProofreading = 0;
        $totalCorrection = 0;
        $totalEditing = 0;
        $totalApprovedPages = 0;
        $totalSalary = 0;

        foreach ($reports as $r) {
            $totalSalary += (float) $r->salary;
            $totalApprovedPages += (float) ($r->conversion_page ?? 0);

            $allocation = $r->allocation;
            if ($allocation && $allocation->completed_page !== null) {
                $name = mb_strtolower($allocation->jobCategory?->name ?? '');
                $pages = (float) $allocation->completed_page;

                if (str_contains($name, 'biên tập')) {
                    $totalEditing += $pages;
                } elseif (str_contains($name, 'đọc đính chính')) {
                    $totalProofreading += $pages;
                } elseif (str_contains($name, 'sửa bài')) {
                    $totalCorrection += $pages;
                }
            }
        }

        return [
            'total_actual_pages' => [
                'proofreading' => (string) $totalProofreading,
                'correction' => (string) $totalCorrection,
                'editing' => (string) $totalEditing,
            ],
            'total_approved_pages' => (string) $totalApprovedPages,
            'total_salary' => number_format($totalSalary, 2, '.', ''),
        ];
    }

    // API 1: Department summary
    public function getDepartmentSummary(?int $fromMonth, ?int $fromYear, ?int $toMonth, ?int $toYear): array
    {
        $query = Report::with(['project.department', 'allocation.jobCategory'])
            ->whereHas('project.department');

        $query = $this->applyOptionalDateFilter($query, $fromMonth, $fromYear, $toMonth, $toYear);

        $reports = $query->get();

        $byDepartment = $reports->groupBy(fn ($r) => $r->project?->department_id ?? 0);
        $departments = Department::whereIn('id', $byDepartment->keys()->filter(fn ($id) => $id > 0))
            ->get()
            ->keyBy('id');

        $result = [];
        foreach ($byDepartment as $departmentId => $departmentReports) {
            if ((int) $departmentId === 0) {
                continue;
            }
            $department = $departments->get($departmentId);
            $totals = $this->sumReportTotals($departmentReports);
            $result[] = array_merge([
                'department_id' => (int) $departmentId,
                'department_name' => $department ? $department->name : '',
                'category' => $department && $department->category !== null ? (string) $department->category : '',
            ], $totals);
        }

        return $result;
    }

    // API 2: Employee summary by department
    public function getEmployeeSummaryByDepartment(
        int $departmentId,
        ?int $fromMonth,
        ?int $fromYear,
        ?int $toMonth,
        ?int $toYear
    ): array {
        $query = Report::with(['allocation.employee', 'allocation.jobCategory', 'project.department'])
            ->whereHas('project', fn ($q) => $q->where('department_id', $departmentId));

        $query = $this->applyOptionalDateFilter($query, $fromMonth, $fromYear, $toMonth, $toYear);

        $reports = $query->get();

        $department = Department::find($departmentId);

        $byEmployee = $reports->groupBy(fn ($r) => $r->allocation?->employee_id ?? 0);

        $employees = [];
        foreach ($byEmployee as $employeeId => $empReports) {
            if ((int) $employeeId === 0) {
                continue;
            }
            $employee = $empReports->first()->allocation?->employee;
            $totals = $this->sumReportTotals($empReports);
            $employees[] = array_merge([
                'employee_id' => (int) $employeeId,
                'employee_name' => $employee ? $employee->name : '',
            ], $totals);
        }

        return [
            'department' => [
                'id' => $department ? (int) $department->id : $departmentId,
                'name' => $department ? $department->name : '',
                'category' => $department && $department->category !== null ? (string) $department->category : '',
            ],
            'employees' => $employees,
        ];
    }

    // API 3: Chi tiết nhân viên trong phòng ban
    public function getEmployeeDetail(
        int $departmentId,
        int $employeeId,
        ?int $fromMonth,
        ?int $fromYear,
        ?int $toMonth,
        ?int $toYear
    ): array {
        $query = Report::with([
            'project.department',
            'project.book.paper',
            'allocation.employee',
            'allocation.jobCategory',
            'salaryCoefficient'
        ])
            ->whereHas('project', fn ($q) => $q->where('department_id', $departmentId))
            ->whereHas('allocation', fn ($q) => $q->where('employee_id', $employeeId));

        $query = $this->applyOptionalDateFilter($query, $fromMonth, $fromYear, $toMonth, $toYear);

        $reports = $query->orderBy('id')->get();

        $department = Department::find($departmentId);
        $employee = $reports->first()?->allocation?->employee;
        $totals = $this->sumReportTotals($reports);

        $details = [];
        $index = 0;
        foreach ($reports as $report) {
            $index++;
            $details[] = $this->mapReportRow($report, $index);
        }

        return array_merge([
            'department' => [
                'id' => $department ? (int) $department->id : $departmentId,
                'name' => $department ? $department->name : '',
                'category' => $department && $department->category !== null ? (string) $department->category : '',
            ],
            'employee' => [
                'id' => $employee ? (int) $employee->id : $employeeId,
                'name' => $employee ? $employee->name : '',
            ],
        ], $totals, [
            'details' => $details,
        ]);
    }
}
