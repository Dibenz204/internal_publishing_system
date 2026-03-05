<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Phòng Toán', 'status' => 1],
            ['name' => 'Phòng Tin', 'status' => 1],
            ['name' => 'Phòng Vật lý', 'status' => 0],
            ['name' => 'Phòng Tổng hợp', 'status' => 1],
        ];

        foreach ($departments as $item) {
            Department::firstOrCreate(
                ['name' => $item['name']],
                ['status' => $item['status']]
            );
        }
    }
}
