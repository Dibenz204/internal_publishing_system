<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EmployeeService;
use Illuminate\Http\Request;
use App\Services\UserService;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\Employee\StoreEmployeeRequest;
use Exception;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Str;

class EmployeeController extends Controller
{
    protected EmployeeService $employeeService;
    protected UserService $userService;

    public function __construct(EmployeeService $employeeService, UserService $userService)
    {
        $this->employeeService = $employeeService;
        $this->userService = $userService;
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


    public function store(Request $request)
    {
        $employee = $this->employeeService->create(
            $request->all()
        );

        return response()->json([
            'success' => true,
            'message' => 'Employee created successfully',
            'data' => $employee
        ], 201);
    }

    public function createUser(int $id, Request $request)
    {
        try {
            $employee = $this->employeeService->findById($id);

            if ($employee->user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nhân viên này đã có tài khoản'
                ], 409);
            }

            // Nếu có username từ request thì dùng, không thì tự gen
            if ($request->has('username') && !empty($request->username)) {
                $username = $request->username;
            } else {
                // Gen username giống bên EmployeeService
                $nameSlug = Str::slug($employee->name, '');
                $birthday = Carbon::parse($employee->birthday)->format('dmY');
                $username = $nameSlug . $birthday;

                // Phòng hờ TH username đã tồn tại
                $originalUsername = $username;
                $counter = 1;
                while (User::where('username', $username)->exists()) {
                    $username = $originalUsername . $counter;
                    $counter++;
                }
            }

            $userData = [
                'username' => $username,
                'password' => $request->input('password') ?? '123456',
                'status' => true,
                'employee_id' => $id,
            ];

            $user = $this->userService->create($userData);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $user
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * PUT /api/employees/{id}
     */
    public function update(Request $request, int $id)
    {
        try {
            $employee = $this->employeeService->update($id, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Employee updated successfully',
                'data' => $employee
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid data',
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

        return response()->json([
            'success' => true,
            'message' => 'Employee deactivated successfully',
            'data' => $employee
        ], 200);
    }

    /**
     * PATCH /api/employees/{id}/activate (đổi trạng thái thành 1)
     */
    public function activate(int $id)
    {
        $employee = $this->employeeService->activate($id);

        return response()->json([
            'success' => true,
            'message' => 'Employee activated successfully',
            'data' => $employee
        ], 200);
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
