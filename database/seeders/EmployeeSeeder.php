<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $employees = [
            [
                'name' => 'Nguyễn Văn A',
                'email' => 'nguyenvana@company.vn',
                'phone' => '0901111001',
                'birthday' => '1990-05-15',
                'sex' => true,
                'status' => true,
                'department' => 'Phòng Biên tập',
                'position' => 'Biên tập viên',
            ],
            [
                'name' => 'Trần Thị B',
                'email' => 'tranthib@company.vn',
                'phone' => '0901111002',
                'birthday' => '1988-08-20',
                'sex' => false,
                'status' => true,
                'department' => 'Phòng Biên tập',
                'position' => 'Biên tập viên trưởng',
            ],
            [
                'name' => 'Lê Văn C',
                'email' => 'levanc@company.vn',
                'phone' => '0901111003',
                'birthday' => '1985-03-10',
                'sex' => true,
                'status' => true,
                'department' => 'Phòng Xuất bản',
                'position' => 'Trưởng phòng xuất bản',
            ],
            [
                'name' => 'Phạm Thị D',
                'email' => 'phamthid@company.vn',
                'phone' => '0901111004',
                'birthday' => '1992-11-25',
                'sex' => false,
                'status' => true,
                'department' => 'Phòng Thiết kế',
                'position' => 'Nhân viên thiết kế',
            ],
            [
                'name' => 'Hoàng Văn E',
                'email' => 'hoangvane@company.vn',
                'phone' => '0901111005',
                'birthday' => '1982-01-08',
                'sex' => true,
                'status' => true,
                'department' => 'Phòng Xuất bản',
                'position' => 'Phó giám đốc',
            ],
        ];

        foreach ($employees as $item) {
            $department = Department::where('name', $item['department'])->first();
            $position = Position::where('name', $item['position'])->first();

            if ($department && $position) {
                Employee::firstOrCreate(
                    ['email' => $item['email']],
                    [
                        'name' => $item['name'],
                        'phone' => $item['phone'],
                        'birthday' => $item['birthday'],
                        'sex' => $item['sex'],
                        'status' => $item['status'],
                        'department_id' => $department->id,
                        'position_id' => $position->id,
                    ]
                );
            }
        }
    }
}
