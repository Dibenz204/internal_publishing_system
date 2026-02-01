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
    // GET /api/departments
    public function index(Request $request)
    {
        $keyword = trim((string) $request->query('keyword'));

        $departments = $this->departmentService->search($keyword);

        return response()->json([
            'success' => true,
            'data'    => $departments,
        ]);
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
}
