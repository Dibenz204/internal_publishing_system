<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\JobCategory;

class JobCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [

            ['name' => 'Biên tập', 'category' => 'A', 'work_coefficient' => 0.25, 'status' => 1],
            ['name' => 'Biên tập', 'category' => 'B', 'work_coefficient' => 1.00, 'status' => 1],
            ['name' => 'Biên tập', 'category' => 'C', 'work_coefficient' => 1.20, 'status' => 1],
            ['name' => 'Biên tập', 'category' => 'D', 'work_coefficient' => 2.00, 'status' => 1],
            ['name' => 'Biên tập', 'category' => 'E', 'work_coefficient' => 0.40, 'status' => 1],
            ['name' => 'Biên tập', 'category' => 'F', 'work_coefficient' => 0.60, 'status' => 1],
            ['name' => 'Biên tập', 'category' => 'G', 'work_coefficient' => 1.10, 'status' => 1],


            ['name' => 'Đọc đính chính', 'category' => 'A', 'work_coefficient' => 0.02, 'status' => 1],
            ['name' => 'Đọc đính chính', 'category' => 'B', 'work_coefficient' => 0.015, 'status' => 1],

                        
            ['name' => 'Sửa bài', 'category' => 'A', 'work_coefficient' => 0.03, 'status' => 1],
            ['name' => 'Sửa bài', 'category' => 'B', 'work_coefficient' => 0.025, 'status' => 1],


        ];

        foreach ($categories as $item) {
            JobCategory::updateOrCreate(
                [
                    'name' => $item['name'],
                    'category' => $item['category']
                ],
                $item
            );
        }
    }
}