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
    return response()->json(
        $this->departmentService->getAll($request->query('keyword'))
    );
}




    // GET /api/departments/{id}
    public function show($id)
    {
        return response()->json(
            $this->departmentService->findById($id)
        );
    }

    // POST /api/departments
    public function store(Request $request)
    {
        $department = $this->departmentService->create($request->all());

        return response()->json($department, 201);
    }

    // PUT /api/departments/{id}
    public function update(Request $request, $id)
    {
        $department = $this->departmentService->update($id, $request->all());

        return response()->json($department);
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