<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Services\ReportService;
use App\Http\Controllers\Controller;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }


    public function store($allocationId)
    {
        try {

            $report = $this->reportService->createFromAllocation($allocationId);

            return response()->json([
                'message' => 'Create report successfully',
                'data' => $report
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }


    public function myDepartmentReport(Request $request)
    {
        $departmentId = auth()->user()->department_id;

        $data = $this->reportService->getDepartmentReport(
            $departmentId,
            [
                'year' => $request->year,
                'month' => $request->month,
                'employee_name' => $request->employee_name
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function overviewReport(Request $request)
    {
        $data = $this->reportService->getOverviewReport([
            'department_id' => $request->department_id,
            'year' => $request->year,
            'month' => $request->month,
            'employee_name' => $request->employee_name
        ]);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function completedProjects(Request $request)
    {
        $filters = $request->validate([
            'department_id' => 'nullable|exists:departments,id',
            'employee_name' => 'nullable|string|max:255',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date'
        ]);

        $report = $this->reportService->getCompletedProjectsReport($filters);

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    public function departmentReport(Request $request, int $departmentId)
    {
        $filters = $request->validate([
            'employee_name' => 'nullable|string|max:255',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date'
        ]);

        $report = $this->reportService->getDepartmentReport($departmentId, $filters);

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    public function projectDetail(int $projectId)
    {
        try {
            $report = $this->reportService->getProjectReportDetail($projectId);

            return response()->json([
                'success' => true,
                'data' => $report
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dự án hoàn thành với ID: ' . $projectId
            ], 404);
        }
    }

    public function monthlySummary(Request $request)
    {
        $validated = $request->validate([
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|min:2020|max:' . now()->year,
            'department_id' => 'nullable|exists:departments,id'
        ]);

        $month = $validated['month'] ?? now()->month;
        $year = $validated['year'] ?? now()->year;

        $report = $this->reportService->getMonthlySummary(
            $month,
            $year,
            $validated['department_id'] ?? null
        );

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }
}
