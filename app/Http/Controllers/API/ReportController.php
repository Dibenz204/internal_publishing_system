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

    //get tất cả
    public function index(Request $request)
    {
        $data = $this->reportService->getAll(
            $request->from_month,
            $request->from_year,
            $request->to_month,
            $request->to_year
        );

        return response()->json([
            'success' => true,
            'message' => 'Reports retrieved successfully',
            'data' => $data
        ]);
    }


    //theo phòng ban
    public function byDepartment(Request $request, $departmentId)
    {
        $data = $this->reportService->getByDepartment(
            $departmentId,
            $request->from_month,
            $request->from_year,
            $request->to_month,
            $request->to_year
        );

        return response()->json([
            'success' => true,
            'message' => 'Department reports retrieved successfully',
            'data' => $data
        ]);
    }


    //theo cá nhân
    public function byEmployee(Request $request, $employeeId)
    {
        $data = $this->reportService->getByEmployee(
            $employeeId,
            $request->from_month,
            $request->from_year,
            $request->to_month,
            $request->to_year
        );

        return response()->json([
            'success' => true,
            'message' => 'Employee reports retrieved successfully',
            'data' => $data
        ]);
    }
}