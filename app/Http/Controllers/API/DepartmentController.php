<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DepartmentService;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    protected DepartmentService $departmentService;

    public function __construct(DepartmentService $departmentService)
    {
        $this->departmentService = $departmentService;
    }

    // GET /api/departments
    public function index(Request $request)
    {
        $departments = $this->departmentService->getAll(
            $request->query('keyword')
        );
    
        return response()->json([
            'success' => true,
            'message' => 'Department list retrieved successfully',
            'data'    => $departments
        ], 200);
    }
    




    // GET /api/departments/{id}
    public function show(int $id)
    {
        $department = $this->departmentService->findById($id);
    
        return response()->json([
            'success' => true,
            'message' => 'Department details retrieved successfully',
            'data'    => $department
        ], 200);
    }
    

    // POST /api/departments
    public function store(Request $request)
    {
        $department = $this->departmentService->create($request->all());
    
        return response()->json([
            'success' => true,
            'message' => 'Department created successfully',
            'data'    => $department
        ], 201);
    }
    

    // PATCH /api/departments/{id} (CHỈ THAY ĐỔI ĐƯỢC NAME)
    public function update(Request $request, int $id)
    {
        $department = $this->departmentService->update($id, $request->all());
    
        return response()->json([
            'success' => true,
            'message' => 'Department updated successfully',
            'data'    => $department
        ], 200);
    }
    
    // PATCH /api/departments/{id}/activate
    public function activate($id)
    {
        $department = $this->departmentService->activate($id);

        return response()->json([
            'success' => true,
            'message' => 'Department activated successfully',
            'data'    => $department,
        ]);
    }

    // PATCH /api/departments/{id}/deactivate
    public function deactivate($id)
    {
        $department = $this->departmentService->deactivate($id);

        return response()->json([
            'success' => true,
            'message' => 'Department deactivated successfully',
            'data'    => $department,
        ]);
    }
}