<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Position;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserDataSeeder extends Seeder
{
    public function run(): void
    {
        $positions = [
            ['name' => 'Admin', 'status' => 1],
            ['name' => 'Nhân viên', 'status' => 1],
        ];

        foreach ($positions as $pos) {
            Position::firstOrCreate(['name' => $pos['name']], $pos);
        }

        $adminPos = Position::where('name', 'Admin')->first();
        $adminEmp = Employee::firstOrCreate(
            ['email' => 'admin@library.com'],
            [
                'name' => 'Admin User',
                'phone' => '0123456789',
                'birthday' => '1990-01-01',
                'sex' => 1,
                'status' => 1,
                'position_id' => $adminPos->id,
                'department_id' => '1',
            ]
        );

        User::firstOrCreate(
            ['username' => 'admin'],
            [
                'password' => Hash::make('123456'),
                'status' => 1,
                'employee_id' => $adminEmp->id,
            ]
        );

        $this->command->info('Đã tạo dữ liệu mẫu thành công!');
    }
}
