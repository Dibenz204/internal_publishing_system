<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Position;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::pluck('id', 'name');
        $positions = Position::pluck('id', 'name');

        $employees = [

            [
                'name' => 'Nguyễn Minh Anh',
                'email' => 'minhanh@gmail.com',
                'phone' => '0900000001',
                'birthday' => '1990-01-01',
                'sex' => 1,
                'department_id' => $departments['Phòng Tổng hợp'] ?? 1,
                'position_id' => $positions['Admin'] ?? 1,
                'status' => 1
            ],

            [
                'name' => 'Trần Ngọc Bích',
                'email' => 'ngocbich@gmail.com',
                'phone' => '0900000002',
                'birthday' => '1985-05-10',
                'sex' => 0,
                'department_id' => $departments['Phòng Tổng hợp'] ?? 1,
                'position_id' => $positions['Giám đốc'] ?? 2,
                'status' => 1
            ],

            [
                'name' => 'Lê Thanh Liêm',
                'email' => 'thanhliem@gmail.com',
                'phone' => '0900000003',
                'birthday' => '1992-03-15',
                'sex' => 1,
                'department_id' => $departments['Phòng Toán'] ?? 1,
                'position_id' => $positions['Thư ký biên tập'] ?? 3,
                'status' => 1
            ],

            [
                'name' => 'Phạm Thị Huyền Trang',
                'email' => 'huyentrang@gmail.com',
                'phone' => '0900000004',
                'birthday' => '1995-07-20',
                'sex' => 0,
                'department_id' => $departments['Phòng Tin'] ?? 1,
                'position_id' => $positions['Nhân viên'] ?? 6,
                'status' => 1
            ],

            [
                'name' => 'Hoàng Gia Đăng',
                'email' => 'giadang@gmail.com',
                'phone' => '0900000005',
                'birthday' => '1993-09-12',
                'sex' => 1,
                'department_id' => $departments['Phòng Vật lý'] ?? 1,
                'position_id' => $positions['Nhân viên'] ?? 6,
                'status' => 1
            ]

        ];

        foreach ($employees as $item) {
            Employee::updateOrCreate(
                ['email' => $item['email']],
                $item
            );
        }
    }
}