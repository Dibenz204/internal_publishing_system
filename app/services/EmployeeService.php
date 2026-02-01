<?php

namespace App\Services;

use App\Models\Employee;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class EmployeeService
{
    /**
     * Lấy danh sách nhân viên (chỉ active)
     */
    public function getAll()
    {
        return Employee::where('status', 1)->get();
    }
    /**
     * Lấy danh sách nhân viên
     */
    public function getAllEmployees()
    {
        return Employee::all();
    }


    /**
     * Tạo nhân viên mới
     */
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {

            if (Employee::where('email', $data['email'])->exists()) {
                throw ValidationException::withMessages([
                    'email' => 'Email đã tồn tại'
                ]);
            }

            $employee = Employee::create([
                'name'         => $data['name'],
                'email'        => $data['email'],
                'phone'        => $data['phone'] ?? null,
                'status'       => $data['status'] ?? 1,
                'departmentId' => $data['departmentId'],
                'positionId'   => $data['positionId'],
            ]);

            Log::info('Employee created', ['id' => $employee->id]);

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

            if (
                isset($data['email']) &&
                $data['email'] !== $employee->email &&
                Employee::where('email', $data['email'])->exists()
            ) {
                throw ValidationException::withMessages([
                    'email' => 'Email đã tồn tại'
                ]);
            }

            $employee->update($data);

            Log::info('Employee updated', ['id' => $employee->id]);

            return $employee;
        });
    }

    /**
     * Xoá nhân viên
     */
    public function delete(int $id)
    {
        $employee = Employee::findOrFail($id);

        if ($employee->status === 1) {
            throw new \Exception('Không thể xoá nhân viên đang hoạt động');
        }

        $employee->delete();

        Log::warning('Employee deleted', ['id' => $id]);

        return true;
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
        return Employee::findOrFail($id);
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
        $query = Employee::query();

        // SEARCH TÊN HOẶC EMAIL (1 Ô)
        if (!empty($filters['keyword'])) {
            $keyword = trim($filters['keyword']);

            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('email', 'like', "%{$keyword}%");
            });
        }
        if (
            isset($filters['departmentId']) &&
            $filters['departmentId'] !== '' &&
            $filters['departmentId'] !== null
        ) {
            $query->where('departmentId', (int) $filters['departmentId']);
        }

        return $query
            ->orderBy('id', 'desc')
            ->paginate(10);
    }
}
