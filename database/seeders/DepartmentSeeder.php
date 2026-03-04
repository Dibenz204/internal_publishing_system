<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Phòng Biên tập', 'status' => true],
            ['name' => 'Phòng Xuất bản', 'status' => true],
            ['name' => 'Phòng Thiết kế', 'status' => true],
            ['name' => 'Phòng Kinh doanh', 'status' => true],
        ];

        foreach ($departments as $item) {
            Department::firstOrCreate(
                ['name' => $item['name']],
                ['status' => $item['status']]
            );
        }
    }
}
