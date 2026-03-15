<?php

namespace App\Services;

use App\Models\Department;
use App\Models\Employee;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;


class DepartmentService
{
    /**
     * Lấy tất cả phòng ban hoặc theo name
     */
    public function getAll(?string $keyword = null)
    {
        return Department::withCount([
            'employees as active_employees_count' => fn($q) => $q->where('status', 1)
        ])
            ->when(!empty(trim($keyword ?? '')), function ($query) use ($keyword) {
                $query->whereRaw(
                    'LOWER(name) LIKE ?',
                    ['%' . strtolower(trim($keyword)) . '%']
                );
            })
            ->orderByDesc('status')
            ->orderByDesc('category')
            ->orderByDesc('id')
            ->get();
    }



    /**
     * Lấy chi tiết phòng ban
     */
    public function findById(int $id): Department
    {
        return Department::with([
            'employees' => function ($query) {
                $query->with('position')
                    ->orderByDesc('status');
            }
        ])->findOrFail($id);
    }

    /**
     * Tạo phòng ban
     */
    public function create(array $data): Department
    {
        $this->validate($data);

        return Department::create([
            'name'    => trim($data['name']),
            'category' => trim($data['category']),
            'status' => 1,
        ]);
    }


    /**
     * Cập nhật phòng ban
     */
    public function update(int $id, array $data): Department
    {
        $this->validate($data, $id);

        $department = Department::findOrFail($id);

        if (isset($data['status']) && (int)$data['status'] === 0) {
            $hasEmployees = Employee::where('department_id', $id)
                ->where('status', 1)->exists();
            if ($hasEmployees) {
                throw ValidationException::withMessages([
                    'status' => ['Phòng ban vẫn còn nhân viên đang làm việc']
                ]);
            }
        }

        $department->update([
            'name' => trim($data['name']),
            'category' => trim($data['category']),
            'status' => trim($data['status']),
        ]);

        return $department;
    }

    public function activate(int $id): Department
    {
        $department = Department::findOrFail($id);
        $department->update(['status' => 1]);
        return $department;
    }

    public function deactivate(int $id): Department
    {
        $department = Department::findOrFail($id);

        $hasEmployees = Employee::where('department_id', $id)
            ->where('status', 1)->exists();

        if ($hasEmployees) {
            throw ValidationException::withMessages([
                'status' => ['Phòng ban vẫn còn nhân viên đang làm việc']
            ]);
        }

        $department->update(['status' => 0]);
        return $department;
    }


    /**
     * Validate dữ liệu
     */
    protected function validate(array $data, ?int $id = null): void
    {
        validator($data, [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('departments', 'name')->ignore($id),
            ],
            'category' => [
                'required',
                'string',
                'max:255'
            ]
        ])->validate();
    }

    /**
     * Lọc theo keyword
     */

    public function search(?string $keyword)
    {
        $keyword = trim((string) $keyword);

        return Department::when($keyword !== '', function ($query) use ($keyword) {
            $query->where('name', 'like', "%{$keyword}%");
        })
            ->orderBy('id', 'desc')
            ->get();
    }
}
