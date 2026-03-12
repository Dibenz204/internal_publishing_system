<?php

namespace App\Services;

use App\Models\Report;

class ReportService
{

    // Lọc theo thời gian
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


    //get theo phòng ban
    public function getByDepartment(
        int $departmentId,
        int $fromMonth,
        int $fromYear,
        int $toMonth,
        int $toYear
    ) {

        $query = Report::with([
            'project.department',
            'allocation.employee',
            'salaryCoefficient'
        ])
        ->whereHas('project', function ($q) use ($departmentId) {
            $q->where('department_id', $departmentId);
        });

        $query = $this->filterByDateRange(
            $query,
            $fromMonth,
            $fromYear,
            $toMonth,
            $toYear
        );

        return $query->orderByDesc('report_year')
            ->orderByDesc('report_month')
            ->get();
    }


    //get theo cá nhân
    public function getByEmployee(
        int $employeeId,
        int $fromMonth,
        int $fromYear,
        int $toMonth,
        int $toYear
    ) {

        $query = Report::with([
            'project.department',
            'allocation.employee',
            'salaryCoefficient'
        ])
        ->whereHas('allocation', function ($q) use ($employeeId) {
            $q->where('employee_id', $employeeId);
        });

        $query = $this->filterByDateRange(
            $query,
            $fromMonth,
            $fromYear,
            $toMonth,
            $toYear
        );

        return $query->orderByDesc('report_year')
            ->orderByDesc('report_month')
            ->get();
    }


    //get toàn bộ
    public function getAll(
        int $fromMonth,
        int $fromYear,
        int $toMonth,
        int $toYear
    ) {

        $query = Report::with([
            'project.department',
            'allocation.employee',
            'salaryCoefficient'
        ]);

        $query = $this->filterByDateRange(
            $query,
            $fromMonth,
            $fromYear,
            $toMonth,
            $toYear
        );

        return $query->orderByDesc('report_year')
            ->orderByDesc('report_month')
            ->get();
    }
}