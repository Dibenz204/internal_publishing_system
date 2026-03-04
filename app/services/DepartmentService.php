<?php

namespace App\Services;

use App\Models\Department;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;


class DepartmentService
{
    /**
     * Lấy tất cả phòng ban hoặc theo name
     */
    public function getAll(?string $keyword = null)
    {
        return Department::query()
            ->when(!empty(trim($keyword ?? '')), function ($query) use ($keyword) {
                $query->whereRaw(
                    'LOWER(name) LIKE ?',
                    ['%' . strtolower(trim($keyword)) . '%']
                );
            })
            ->orderByDesc('id')
            ->get();
    }
    


    /**
     * Lấy chi tiết phòng ban
     */
    public function findById(int $id): Department
    {
        return Department::findOrFail($id);
    }

    /**
     * Tạo phòng ban
     */
    public function create(array $data): Department
{
    $this->validate($data);

    return Department::create([
        'name'   => trim($data['name']),
        'status' => 1, // luôn active khi tạo
    ]);
}


    /**
     * Cập nhật phòng ban
     */
    public function update(int $id, array $data): Department
{
    $this->validate($data, $id);

    $department = Department::findOrFail($id);

    $department->update([
        'name' => trim($data['name']),
    ]);

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

    /**
 * (status = 1)
 */
public function activate(int $id): Department
{
    $department = Department::findOrFail($id);

    $department->update([
        'status' => 1
    ]);

    return $department;
}

/**
 *(status = 0)
 */
public function deactivate(int $id): Department
{
    $department = Department::with('employees')->findOrFail($id);

    if ($department->employees()->where('status', 1)->exists()) {
        throw new \Exception('Cannot deactivate this department because it still has active employees.');
    }

    $department->update([
        'status' => 0
    ]);

    return $department;
}


}