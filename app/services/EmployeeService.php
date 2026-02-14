<?php

namespace App\Services;

use App\Models\Employee;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;


class EmployeeService



{

    private function validateEmployee(array $data, ?int $id = null): array
{
    $rules = [
        'name'          => 'sometimes|required|string|max:255',
        'email'         => 'sometimes|required|email|unique:employees,email' . ($id ? ',' . $id : ''),
        'phone'         => 'required|digits:11|unique:employees,phone' . ($id ? ',' . $id : ''),
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

        $data['name'] = trim($data['name']);
        $data['email'] = strtolower(trim($data['email']));
        $data['sex'] = isset($data['sex']) ? (int)$data['sex'] : null;
        $data['status'] = isset($data['status']) ? (int)$data['status'] : 1;

        return Employee::create($data);
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
        $employee = Employee::findOrFail($id);
        $employee->update(['status' => 0]);

        return $employee;
    }
    /**
     * Tìm nhân viên theo id
     */
    public function findById(int $id)
    {
        $employee = Employee::with([
            'department:id,name',
            'position:id,name'
        ])->findOrFail($id);
    
        return [
            'id' => $employee->id,
            'name' => $employee->name,
            'email' => $employee->email,
            'phone' => $employee->phone,
            'sex' => $employee->sex,
            'status' => $employee->status,
    
            'department' => [
                'id' => $employee->department->id ?? null,
                'name' => $employee->department->name ?? null,
            ],
    
            'position' => [
                'id' => $employee->position->id ?? null,
                'name' => $employee->position->name ?? null,
            ]
        ];
    }
    

    /**
     * Mở lại nhân viên (đổi trạng thái thành 1)
     */
    public function activate(int $id)
    {
        $employee = Employee::findOrFail($id);
        $employee->update(['status' => 1]);
        return $employee;
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