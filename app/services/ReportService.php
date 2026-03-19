<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use App\Models\Project;
use App\Models\Allocation;
use App\Models\Report;
use App\Models\SalaryCoefficient;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function createFromAllocation(int $allocationId)
    {
        return DB::transaction(function () use ($allocationId) {

            $allocation = Allocation::with([
                'project.book.paper'
            ])->findOrFail($allocationId);

            $exists = Report::where('allocation_id', $allocation->id)->exists();
            if ($exists) {
                throw new \Exception('Allocation này đã có report.');
            }

            $project = $allocation->project;
            $book = $project->book;
            $paper = $book->paper;

            $completedPage = $allocation->completed_page;
            $paperCoefficient = $paper->paper_coefficient;


            $conversionPage = $completedPage * $paperCoefficient;


            $salaryCoefficient = SalaryCoefficient::where('status', 1)->firstOrFail();

            return Report::create([
                'allocation_id' => $allocation->id,
                'project_id' => $project->id,
                'salary_coefficient_id' => $salaryCoefficient->id,
                'conversion_page' => $conversionPage,
                'salary' => 0,
                'report_year' => now()->year,
                'report_month' => now()->month,
                'status' => 1
            ]);
        });
    }

    private function getSalaryPerPaper()
    {
        return SalaryCoefficient::where('status', 1)->value('salary_per_paper') ?? 0;
    }

    private function buildReportRows($projects, array $filters = [])
    {
        $rows = [];
        $index = 1;

        foreach ($projects as $project) {
            $book = $project->book;
            $paper = $book?->paper;
            $paperCoefficient = $paper?->paper_coefficient ?? 1;

            $grouped = $project->allocations->groupBy('employee_id');

            foreach ($grouped as $employeeId => $allocations) {
                $employee = $allocations->first()->employee;

                if (!empty($filters['employee_id']) && $employeeId != $filters['employee_id']) {
                    continue;
                }

                if (!empty($filters['employee_name']) && $employee) {
                    if (stripos($employee->name, $filters['employee_name']) === false) {
                        continue;
                    }
                }

                if (!empty($filters['department_id']) && $employee) {
                    if ($employee->department_id != $filters['department_id']) {
                        continue;
                    }
                }

                $completedPages = $allocations->first()->completed_page;
                $conversionPage = $completedPages * $paperCoefficient;

                $editingCoef = 0.25;
                $proofreadingCoef = 0.02;
                $correctionCoef = 0.03;

                $editingPage = 0;
                $proofreadingPage = 0;
                $correctionPage = 0;

                foreach ($allocations as $allocation) {
                    $job = $allocation->jobCategory;
                    $category = $job?->category;
                    $coef = $job?->work_coefficient;

                    if ($category === 'Biên tập') {
                        $editingCoef = $coef ?? $editingCoef;
                        $editingPage = $conversionPage;
                    }

                    if ($category === 'Đính chính') {
                        $proofreadingCoef = $coef ?? $proofreadingCoef;
                        $proofreadingPage = $conversionPage;
                    }

                    if ($category === 'Sửa bài') {
                        $correctionCoef = $coef ?? $correctionCoef;
                        $correctionPage = $conversionPage;
                    }
                }

                $decisionPage = ($editingPage * $editingCoef) +
                    ($proofreadingPage * $proofreadingCoef) +
                    ($correctionPage * $correctionCoef);

                $salaryPerPaper = $this->getSalaryPerPaper();
                $salary = $decisionPage * $salaryPerPaper;

                $rows[] = [
                    'index' => $index++,
                    'book_name' => $book?->name,
                    'completed_page' => $completedPages,
                    'paper_size' => $paper?->paperSize,
                    'type' => '',
                    'publishing' => '',
                    'paper_coefficient' => $paperCoefficient,
                    'conversion_page' => $conversionPage,
                    'editing_coefficient' => $editingCoef,
                    'proofreading_coefficient' => $proofreadingCoef,
                    'correction_coefficient' => $correctionCoef,
                    'editing_page' => $editingPage,
                    'proofreading_page' => $proofreadingPage,
                    'correction_page' => $correctionPage,
                    'decision_page' => $decisionPage,
                    'department' => $project->department?->name,
                    'salary_per_page' => $salaryPerPaper,
                    'salary' => $salary,
                    'employee_name' => $employee?->name
                ];
            }
        }

        return $rows;
    }


    public function getOverviewReport(array $filters, $userId = null)
    {
        $query = Project::with([
            'department',
            'book.paper',
            'allocations.employee',
            'allocations.jobCategory'
        ])->where('status', 3);


        if (!empty($filters['department_id'])) {

            $query->where('department_id', $filters['department_id']);
        }

        if (!empty($filters['employee_name'])) {
            $query->whereHas('allocations.employee', function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['employee_name'] . '%');
            });
        }

        $projects = $query->get();
        return $this->buildReportRows($projects, $filters);
    }


    public function getCompletedProjectsReport(array $filters = [])
    {
        $query = Project::where('status', 3)->with([
            'department',
            'book.paper',
            'allocations.employee',
            'allocations.jobCategory'
        ]);

        if (!empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (!empty($filters['employee_name'])) {
            $query->whereHas('allocations.employee', function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['employee_name'] . '%');
            });
        }

        if (!empty($filters['employee_id'])) {
            $query->whereHas('allocations', function ($q) use ($filters) {
                $q->where('employee_id', $filters['employee_id']);
            });
        }

        if (!empty($filters['from_date'])) {
            $query->whereDate('updated_at', '>=', $filters['from_date']);
        }

        if (!empty($filters['to_date'])) {
            $query->whereDate('updated_at', '<=', $filters['to_date']);
        }

        $projects = $query->get();
        $rows = $this->buildReportRows($projects, $filters);

        return [
            // 'projects' => $this->buildReportRows($projects),
            'projects' => $rows,
            'total_projects' => $projects->count(),
            'total_salary' => collect($rows)->sum('salary'),
            'generated_at' => now()->format('d/m/Y H:i:s')
        ];
    }

    public function getDepartmentReport(int $departmentId, array $filters = [])
    {
        $filters['department_id'] = $departmentId;
        return $this->getCompletedProjectsReport($filters);
    }

    public function getProjectReportDetail(int $projectId)
    {
        $project = Project::where('status', 3)
            ->with([
                'department',
                'book.paper',
                'allocations.employee',
                'allocations.jobCategory'
            ])
            ->findOrFail($projectId);

        Log::info('Project status: ' . $project->status);

        if ($project->status != 3) {
            throw new \Exception('Dự án chưa hoàn thành (status = ' . $project->status . ')');
        }

        $reportData = $this->buildReportRows(collect([$project]));

        return [
            'project_info' => [
                'id' => $project->id,
                'name' => $project->name,
                'code' => $project->code,
                'department' => $project->department?->name,
                'status' => $project->status,
                'completed_at' => $project->updated_at->format('d/m/Y')
            ],
            'book_info' => [
                'name' => $project->book?->name,
                'paper_size' => $project->book?->paper?->paperSize,
                'paper_coefficient' => $project->book?->paper?->paper_coefficient ?? 1
            ],
            'employees' => $reportData,
            'total_salary' => collect($reportData)->sum('salary')
        ];
    }

    public function getMonthlySummary(int $month, int $year, ?int $departmentId = null)
    {
        $query = Project::where('status', 3)
            ->whereYear('updated_at', $year)
            ->whereMonth('updated_at', $month);

        if ($departmentId) {
            $query->byDepartment($departmentId);
        }

        $projects = $query->with(['allocations.employee', 'department'])->get();

        $reportData = $this->buildReportRows($projects);

        return [
            'month' => $month,
            'year' => $year,
            'department_id' => $departmentId,
            'total_projects' => $projects->count(),
            'total_employees' => collect($reportData)->unique('employee_name')->count(),
            'total_salary' => collect($reportData)->sum('salary'),
            'details' => $reportData
        ];
    }
}
