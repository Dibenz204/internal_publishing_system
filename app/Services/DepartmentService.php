<?php

namespace App\Services;

use App\Models\Department;
use App\Models\Employee;
use App\Traits\LogsActivity;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;


class DepartmentService
{
    use LogsActivity;

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



    public function findById(int $id): Department
    {
        return Department::with([
            'employees' => function ($query) {
                $query->with('position')
                    ->orderByDesc('status');
            }
        ])->findOrFail($id);
    }

    public function create(array $data): Department
    {
        $this->validate($data);

        $department = Department::create([
            'name'     => trim($data['name']),
            'category' => trim($data['category']),
            'status'   => $data['status'] ?? 1,
        ]);

        $this->logCreate('department', $department->id, [
            'name' => $department->name,
            'category' => $department->category
        ]);

        return $department;
    }


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

        $oldDepartment = $department->toArray();

        $department->update([
            'name' => trim($data['name']),
            'category' => trim($data['category']),
            'status' => trim($data['status']),
        ]);

        $newData = $department->fresh()->toArray();

        $this->logUpdate('department', $department->id, $oldDepartment, $newData);

        return $department;
    }

    public function activate(int $id): Department
    {
        $department = Department::findOrFail($id);

        $department->update(['status' => 1]);

        $this->logUpdate(
            'book',
            $id,
            ['status' => 'Ngừng'],
            ['status' => 'Hoạt động']
        );

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

        $this->logUpdate(
            'book',
            $id,
            ['status' => 'Hoạt động'],
            ['status' => 'Ngừng']
        );

        return $department;
    }



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
