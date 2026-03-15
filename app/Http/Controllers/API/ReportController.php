<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    protected ReportService $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    private function dateParams(Request $request): array
    {
        return [
            $request->input('from_month') ? (int) $request->input('from_month') : null,
            $request->input('from_year') ? (int) $request->input('from_year') : null,
            $request->input('to_month') ? (int) $request->input('to_month') : null,
            $request->input('to_year') ? (int) $request->input('to_year') : null,
        ];
    }

    public function departmentSummary(Request $request)
    {
        $data = $this->reportService->getDepartmentSummary(...$this->dateParams($request));

        return response()->json([
            'success' => true,
            'message' => 'Department summary retrieved successfully',
            'data' => $data,
        ]);
    }

    public function employeeSummary(Request $request, $departmentId)
    {
        $data = $this->reportService->getEmployeeSummaryByDepartment(
            (int) $departmentId,
            ...$this->dateParams($request)
        );

        return response()->json([
            'success' => true,
            'message' => 'Employee summary retrieved successfully',
            'data' => $data,
        ]);
    }

    public function employeeDetail(Request $request, $departmentId, $employeeId)
    {
        $data = $this->reportService->getEmployeeDetail(
            (int) $departmentId,
            (int) $employeeId,
            ...$this->dateParams($request)
        );

        return response()->json([
            'success' => true,
            'message' => 'Employee report details retrieved successfully',
            'data' => $data,
        ]);
    }
}
