<?php

namespace App\Services;

use App\Models\Department;
use Illuminate\Validation\ValidationException;

class DepartmentService
{
    /**
     * Lấy tất cả phòng ban
     */
    public function getAll()
    {
        return Department::orderBy('id', 'desc')->get();
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
            'name'   => $data['name'],
            'status' => (int) $data['status'], // bit
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
            'name'   => $data['name'],
            'status' => (int) $data['status'],
        ]);

        return $department;
    }


    /**
     * Validate dữ liệu
     */
    protected function validate(array $data, int $id = null): void
    {
        validator($data, [
            'name' => 'required|string|max:255',
            // SQL Server bit → 0 | 1
            'status' => 'required|in:0,1',
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
