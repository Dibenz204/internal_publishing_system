<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Phòng Toán', 'category' => 'Biên tập', 'status' => 1],
            ['name' => 'Phòng Tin', 'category' => 'Sửa bài', 'status' => 1],
            ['name' => 'Phòng Vật lý', 'category' => 'Đọc đính chính', 'status' => 0],
            ['name' => 'Phòng Tổng hợp', 'category' => 'Biên tập', 'status' => 1],
        ];

        foreach ($departments as $item) {
            Department::firstOrCreate(
                ['name' => $item['name']],
                [
                    'category' => $item['category'],
                    'status' => $item['status']
                ]
            );
        }
    }
}