<?php

namespace Database\Seeders;

use App\Models\Position;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    public function run(): void
    {
        $positions = [
            ['name' => 'Biên tập viên', 'status' => true],
            ['name' => 'Biên tập viên trưởng', 'status' => true],
            ['name' => 'Trưởng phòng xuất bản', 'status' => true],
            ['name' => 'Nhân viên thiết kế', 'status' => true],
            ['name' => 'Phó giám đốc', 'status' => true],
        ];

        foreach ($positions as $item) {
            Position::firstOrCreate(
                ['name' => $item['name']],
                ['status' => $item['status']]
            );
        }
    }
}
