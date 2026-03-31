<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Allocation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use App\Models\Position;
use App\Models\Department;
use Carbon\Carbon;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Support\Str;

class EmployeeService
{
    use LogsActivity;

    private function validateEmployee(array $data, ?int $id = null): array
    {
        $rules = [
            'name'          => 'sometimes|required|string|max:255',
            'email'         => 'sometimes|required|email|unique:employees,email' . ($id ? ',' . $id : ''),
            'phone'         => 'sometimes|nullable|digits_between:10,11|unique:employees,phone' . ($id ? ',' . $id : ''),
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
            ->orderByDesc('status')
            ->orderByDesc('position')
            ->orderByDesc('id')
            ->get();
    }

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

            $this->logCreate('employee', $employee->id, [
                'name' => $employee->name,
                'email' => $employee->email,
                'phone' => $employee->phone,
                'sex' => $employee->sex == 1 ? 'Nam' : ($employee->sex == 2 ? 'Nữ' : 'Khác'),
                'department' => [
                    'id' => $department->id,
                    'name' => $department->name
                ],
                'position' => [
                    'id' => $position->id,
                    'name' => $position->name
                ],
                'username' => $username,
            ]);

            return $employee;
        });
    }

    public function update(int $id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {

            $employee = Employee::findOrFail($id);

            $data = $this->validateEmployee($data, $id);

            $oldData = [
                'id' => $employee->id,
                'name' => $employee->name,
                'email' => $employee->email,
                'phone' => $employee->phone,
                'department' => [
                    'id' => $employee->department_id,
                    'name' => $employee->department->name ?? null,
                ],
                'position' => [
                    'id' => $employee->position_id,
                    'name' => $employee->position->name ?? null,
                ],
                'status' => $employee->status,
                'status_text' => $employee->status == 1 ? 'Đang làm' : 'Nghỉ làm',
            ];

            if (isset($data['department_id'])) {
                $department = Department::findOrFail($data['department_id']);

                if ($department->status != 1) {
                    throw ValidationException::withMessages([
                        'department_id' => ['Department is inactive'],
                    ]);
                }
            }


            if (isset($data['position_id'])) {
                $position = Position::findOrFail($data['position_id']);

                if ($position->status != 1) {
                    throw ValidationException::withMessages([
                        'position_id' => ['Position is inactive'],
                    ]);
                }
            }


            if (isset($data['name'])) {
                $data['name'] = trim($data['name']);
            }

            if (isset($data['email'])) {
                $data['email'] = strtolower(trim($data['email']));
            }

            if (isset($data['sex'])) {
                $data['sex'] = (int)$data['sex'];
            }

            if (isset($data['status']) && $data['status'] != $employee->status) {

                $hasActiveAllocation = Allocation::where('employee_id', $id)
                    ->whereIn('status', [1, 3])
                    ->exists();

                if ($hasActiveAllocation) {
                    throw ValidationException::withMessages([
                        'status' => ['Employee is currently assigned to an active allocation'],
                    ]);
                }
            }

            $employee->update($data);

            $employee->load(['department', 'position']);

            $newData = [
                'id' => $employee->id,
                'name' => $employee->name,
                'email' => $employee->email,
                'phone' => $employee->phone,
                'department' => [
                    'id' => $employee->department_id,
                    'name' => $employee->department->name ?? null,
                ],
                'position' => [
                    'id' => $employee->position_id,
                    'name' => $employee->position->name ?? null,
                ],
                'status' => $employee->status
            ];

            $this->logUpdate('employee', $id, $oldData, $newData);

            return $employee->fresh();
        });
    }


    public function deactivate(int $id)
    {
        return DB::transaction(function () use ($id) {

            $employee = Employee::with('user')->findOrFail($id);

            $employee->update(['status' => 0]);

            if ($employee->user) {
                $employee->user->update(['status' => false]);
            }

            $this->logUpdate(
                'employee',
                $id,
                ['status' => 'Đang làm'],
                ['status' => 'Nghỉ làm']
            );

            return $employee->fresh()->load('user');
        });
    }

    public function findById(int $id)
    {
        return Employee::with([
            'department:id,name',
            'position:id,name',
            'user'
        ])->findOrFail($id);
    }


    public function activate(int $id)
    {
        return DB::transaction(function () use ($id) {
            $employee = Employee::with('user')->findOrFail($id);
            $employee->update(['status' => 1]);

            if ($employee->user) {
                $employee->user->update(['status' => true]);
            }

            $this->logUpdate(
                'employee',
                $id,
                ['status' => 'Nghỉ làm'],
                ['status' => 'Đang làm']
            );

            return $employee->fresh()->load('user');
        });
    }


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
                    ->orWhere('phone', 'like', "%{$keyword}%")
                    ->orWhereHas('position', function ($q2) use ($keyword) {
                        $q2->where('name', 'like', "%{$keyword}%");
                    });
            });
        }

        if (isset($filters['status']) && $filters['status'] !== '') {
            $query->where('status', (int)$filters['status']);
        }

        return $query->orderByDesc('status')->orderByDesc('id')->paginate(10);
    }
}
