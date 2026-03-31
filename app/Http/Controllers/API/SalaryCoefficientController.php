<?php

namespace App\Http\Controllers\API;

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

    public function getAll()
    {
        $data = $this->salaryService->getAll();

        return response()->json([
            'success' => true,
            'message' => 'Salary coefficients retrieved successfully',
            'data' => $data
        ]);
    }

    public function create(Request $request)
    {
        $data = $this->salaryService->create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Salary coefficient created successfully',
            'data' => $data
        ]);
    }
}
