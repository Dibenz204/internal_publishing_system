<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserService
{
    private function validateCreate(array $data): array
    {
        $validator = Validator::make($data, [
            'username'    => 'required|string|unique:users,username',
            'password'    => 'required|string|min:6',
            'status'      => 'sometimes|boolean',
            'employee_id' => 'sometimes|nullable|exists:employees,id',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    private function validateUpdate(array $data, $userId): array
    {
        $validator = Validator::make($data, [
            'username'    => ['sometimes', 'string', Rule::unique('users', 'username')->ignore($userId)],
            'password'    => 'sometimes|string|min:6',
            'status'      => 'sometimes|boolean',
            'employee_id' => 'sometimes|nullable|exists:employees,id',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    public function create(array $data): User
    {
        if (!isset($data['status'])) {
            $data['status'] = true;
        }

        $validated = $this->validateCreate($data);

        return User::create($validated);
    }

    public function update(User $user, array $data): User
    {
        $validated = $this->validateUpdate($data, $user->id);

        $user->update($validated);

        return $user->fresh();
    }

    public function getAll()
    {
        return User::with('employee.position')->get();
    }

    // Search theo tên nhân viên (employee.name)
    public function getByEmployeeName(string $name)
    {
        return User::with('employee.position')
            ->whereHas('employee', function ($query) use ($name) {
                $query->where('name', 'like', "%{$name}%");
            })
            ->get();
    }

    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mật khẩu hiện tại không đúng']
            ]);
        }

        if (strlen($newPassword) < 6) {
            throw ValidationException::withMessages([
                'new_password' => ['Mật khẩu mới phải có ít nhất 6 ký tự']
            ]);
        }

        if (Hash::check($newPassword, $user->password)) {
            throw ValidationException::withMessages([
                'new_password' => ['Mật khẩu mới không được trùng mật khẩu hiện tại']
            ]);
        }

        $user->update(['password' => $newPassword]);

        return true;
    }

    public function findUserByContact(string $contact): User
    {
        $user = User::whereHas('employee', function ($query) use ($contact) {
            $query->where('email', $contact)
                ->orWhere('phone', $contact);
        })->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'contact' => ['Không tìm thấy tài khoản với thông tin này']
            ]);
        }

        return $user;
    }

    public function resetPassword(int $userId, string $newPassword): bool
    {
        if (strlen($newPassword) < 6) {
            throw ValidationException::withMessages([
                'new_password' => ['Mật khẩu phải có ít nhất 6 ký tự']
            ]);
        }

        $user = User::findOrFail($userId);
        $user->update(['password' => $newPassword]);

        return true;
    }
}
