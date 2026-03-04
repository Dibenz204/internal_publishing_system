<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Position;
use App\Models\Employee;
use App\Models\User;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;

class UserDataSeeder extends Seeder
{
    public function run(): void
    {
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

        $editorPos = Position::where('name', 'Thư kí biên tập')->first();
        $editorDep = Department::where('name', 'Phòng tổng hợp')->first();
        $editorEmp = Employee::firstOrCreate(
            ['email' => 'editor@library.com'],
            [
                'name' => 'Editor User',
                'phone' => '0987654321',
                'birthday' => '1995-05-15',
                'sex' => 1,
                'status' => 1,
                'position_id' => $editorPos->id,
                'department_id' => $editorDep->id,
            ]
        );

        User::firstOrCreate(
            ['username' => 'editor'],
            [
                'password' => Hash::make('123456'),
                'status' => 1,
                'employee_id' => $editorEmp->id,
            ]
        );


        $this->command->info('Đã tạo dữ liệu mẫu thành công!');
    }
}
