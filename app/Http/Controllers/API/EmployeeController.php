<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EmployeeService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\Employee\StoreEmployeeRequest;
use Exception;

class EmployeeController extends Controller
{
    protected EmployeeService $employeeService;

    public function __construct(EmployeeService $employeeService)
    {
        $this->employeeService = $employeeService;
    }

    /**
     * GET /api/employees
     */
    public function active()
    {
        return response()->json(
            $this->employeeService->getAll()
        );
    }

    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Employee list retrieved successfully',
            'data' => $this->employeeService->getAllEmployees()
        ], 200);
    }
    


    /**
     * POST /api/employees
     */
   

     public function store(Request $request)
{
    $employee = $this->employeeService->create(
        $request->all()
    );

    return response()->json([
        'message' => 'Tạo nhân viên thành công',
        'data' => $employee
    ], 201);
}
     
     


    /**
     * PUT /api/employees/{id}
     */
    public function update(Request $request, int $id)
    {
        try {
            $employee = $this->employeeService->update($id, $request->all());

            return response()->json($employee);
        } catch (ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], 422);
        }
    }



    /**
     * PATCH /api/employees/{id}/deactivate (đổi trạng thái thành 0)
     */
    public function deactivate(int $id)
    {
        $employee = $this->employeeService->deactivate($id);

        return response()->json($employee);
    }

    public function show($id)
    {
        return response()->json(
            $this->employeeService->findById($id)
        );
    }

    /**
     * PATCH /api/employees/{id}/activate (đổi trạng thái thành 1)
     */
    public function activate(int $id)
    {

        $employee = $this->employeeService->activate($id);
        return response()->json($employee);
    }

    /**
     * Search / Filter / Pagination
     * GET /api/employees/search
     */
    public function search(Request $request)
{
    $filters = [
        'keyword'       => $request->query('keyword'),
        'department_id' => $request->query('department_id'),
        'position_id'   => $request->query('position_id'),
        'per_page'      => $request->query('per_page', 10),
    ];

    $result = $this->employeeService->search($filters);

    return response()->json([
        'success' => true,
        'data'    => $result->items(),
        'meta'    => [
            'current_page' => $result->currentPage(),
            'per_page'     => $result->perPage(),
            'total'        => $result->total(),
            'last_page'    => $result->lastPage(),
        ]
    ]);
}
}