<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\SalaryCoefficientService;

class SalaryCoefficientController extends Controller
{
    protected $salaryService;

    public function __construct(SalaryCoefficientService $salaryService)
    {
        $this->salaryService = $salaryService;
    }
    /**
     *Lấy tất cả
     */
    public function getAll()
    {
        $data = $this->salaryService->getAll();

        return response()->json([
            'success' => true,
            'message' => 'Salary coefficients retrieved successfully',
            'data' => $data
        ]);
    }

    /**
     * Tạo hệ số lương
     */
    public function create(Request $request)
    {
        $data = $this->salaryService->create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Salary coefficient created successfully',
            'data' => $data
        ]);
    }

    /**
     * Tắt trạng thái
     */
    public function disable($id)
    {
        $data = $this->salaryService->disable($id);

        return response()->json([
            'success' => true,
            'message' => 'Salary coefficient disabled successfully',
            'data' => $data
        ]);
    }

    /**
     * Bật trạng thái
     */
    public function enable($id)
    {
        $data = $this->salaryService->enable($id);

        return response()->json([
            'success' => true,
            'message' => 'Salary coefficient enabled successfully',
            'data' => $data
        ]);
    }
}