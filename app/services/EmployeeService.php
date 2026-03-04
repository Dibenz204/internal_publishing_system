<?php

namespace App\Services;

use App\Models\Employee;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use App\Models\Position;
use App\Models\Department;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Str;

class EmployeeService
{

    private function validateEmployee(array $data, ?int $id = null): array
    {
        $rules = [
            'name'          => 'sometimes|required|string|max:255',
            'email'         => 'sometimes|required|email|unique:employees,email' . ($id ? ',' . $id : ''),
            'phone'         => 'sometimes|nullable|digits:11|unique:employees,phone' . ($id ? ',' . $id : ''),
            'birthday'      => 'nullable|date',
            'sex'           => 'nullable|in:0,1',
            'status'        => 'nullable|in:0,1',
            'department_id' => 'sometimes|required|exists:departments,id',
            'position_id'   => 'sometimes|required|exists:positions,id',
        ];

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }



    /**
     * Lấy danh sách nhân viên (chỉ active)
     */
    public function getAll()
    {
        return Employee::select(
            'id',
            'name',
            'email',
            'phone',
            'birthday',
            'sex',
            'status',
            'department_id',
            'position_id'
        )
            ->with([
                'department:id,name',
                'position:id,name'
            ])
            ->where('status', 1)
            ->get();
    }
    /**
     * Lấy danh sách nhân viên
     */
    public function getAllEmployees()
    {
        return Employee::select(
            'id',
            'name',
            'email',
            'phone',
            'birthday',
            'sex',
            'status',
            'department_id',
            'position_id'
        )
            ->with([
                'department:id,name',
                'position:id,name'
            ])
            ->get();
    }



    /**
     * Tạo nhân viên mới
     */
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {

            $data = $this->validateEmployee($data);

            $department = Department::findOrFail($data['department_id']);
            if ($department->status != 1) {
                throw ValidationException::withMessages([
                    'department_id' => ['Department is inactive'],
                ]);
            }

            $position = Position::findOrFail($data['position_id']);
            if ($position->status != 1) {
                throw ValidationException::withMessages([
                    'position_id' => ['Position is inactive'],
                ]);
            }

            $data['name'] = trim($data['name']);
            $data['email'] = strtolower(trim($data['email']));
            $data['sex'] = isset($data['sex']) ? (int)$data['sex'] : null;
            $data['status'] = isset($data['status']) ? (int)$data['status'] : 1;

            $employee = Employee::create($data);

            $nameSlug = Str::slug($employee->name, '');
            $birthday = Carbon::parse($employee->birthday)->format('dmY');
            $username = $nameSlug . $birthday;

            // Phòng hờ TH nếu username đã tồn tại
            $originalUsername = $username;
            $counter = 1;
            while (User::where('username', $username)->exists()) {
                $username = $originalUsername . $counter;
                $counter++;
            }

            $userData = [
                'username' => $username,
                'password' => '123456',
                'status' => 1,
                'employee_id' => $employee->id
            ];

            app(UserService::class)->create($userData);

            return $employee;
        });
    }
    /**
     * Cập nhật nhân viên
     */
    public function update(int $id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {

            $employee = Employee::findOrFail($id);

            $data = $this->validateEmployee($data, $id);

            //check department active nếu có gửi
            if (isset($data['department_id'])) {
                $department = Department::findOrFail($data['department_id']);

                if ($department->status != 1) {
                    throw ValidationException::withMessages([
                        'department_id' => ['Department is inactive'],
                    ]);
                }
            }

            // check position active nếu có gửi
            if (isset($data['position_id'])) {
                $position = Position::findOrFail($data['position_id']);

                if ($position->status != 1) {
                    throw ValidationException::withMessages([
                        'position_id' => ['Position is inactive'],
                    ]);
                }
            }

            // normalize
            if (isset($data['name'])) {
                $data['name'] = trim($data['name']);
            }

            if (isset($data['email'])) {
                $data['email'] = strtolower(trim($data['email']));
            }

            if (isset($data['sex'])) {
                $data['sex'] = (int)$data['sex'];
            }

            if (isset($data['status'])) {
                $data['status'] = (int)$data['status'];
            }

            $employee->update($data);

            return $employee->fresh();
        });
    }


    /**
     * Vô hiệu hoá nhân viên( đổi trạng thái thành 0)
     */
    public function deactivate(int $id)
    {
        return DB::transaction(function () use ($id) {

            $employee = Employee::with('user')->findOrFail($id);

            $employee->update(['status' => 0]);

            if ($employee->user) {
                $employee->user->update(['status' => false]);
            }

            return $employee->fresh()->load('user');
        });
    }
    /**
     * Tìm nhân viên theo id
     */
    public function findById(int $id)
    {
        return Employee::with([
            'department:id,name',
            'position:id,name',
            'user'
        ])->findOrFail($id);
    }


    /**
     * Mở lại nhân viên (đổi trạng thái thành 1)
     */
    public function activate(int $id)
    {
        return DB::transaction(function () use ($id) {
            $employee = Employee::with('user')->findOrFail($id);
            $employee->update(['status' => 1]);

            if ($employee->user) {
                $employee->user->update(['status' => true]);
            }

            return $employee->fresh()->load('user');
        });
    }

    /**
     * Search / Filter employees
     */
    public function search(array $filters)
    {
        $query = Employee::with(['department', 'position']);

        if (isset($filters['department_id']) && $filters['department_id'] !== '') {
            $query->where('department_id', (int)$filters['department_id']);
        }

        if (isset($filters['position_id']) && $filters['position_id'] !== '') {
            $query->where('position_id', (int)$filters['position_id']);
        }

        if (isset($filters['keyword']) && $filters['keyword'] !== '') {
            $keyword = trim($filters['keyword']);

            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('email', 'like', "%{$keyword}%");
            });
        }

        return $query->orderByDesc('id')->paginate(10);
    }
}
