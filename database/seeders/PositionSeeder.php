<?php

namespace Database\Seeders;

use App\Models\Position;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    public function run(): void
    {
        $positions = [
            ['name' => 'Admin', 'status' => 1],
            ['name' => 'Giám đốc', 'status' => 1],
            ['name' => 'Thư ký biên tập', 'status' => 1],
            ['name' => 'HR', 'status' => 1],
            ['name' => 'Trưởng phòng', 'status' => 1],
            ['name' => 'Nhân viên', 'status' => 1],
        ];

        foreach ($positions as $item) {
            Position::firstOrCreate(
                ['name' => $item['name']],
                ['status' => $item['status']]
            );
        }
    }
}
