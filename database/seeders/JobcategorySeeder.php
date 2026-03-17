<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\JobCategory;

class JobCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [

            ['name' => 'A', 'category' => 'Biên tập', 'work_coefficient' => 0.25, 'status' => 1],
            ['name' => 'B', 'category' => 'Biên tập', 'work_coefficient' => 1.00, 'status' => 1],
            ['name' => 'C', 'category' => 'Biên tập', 'work_coefficient' => 1.20, 'status' => 1],
            ['name' => 'D', 'category' => 'Biên tập', 'work_coefficient' => 2.00, 'status' => 1],
            ['name' => 'E', 'category' => 'Biên tập', 'work_coefficient' => 0.40, 'status' => 1],
            ['name' => 'F', 'category' => 'Biên tập', 'work_coefficient' => 0.60, 'status' => 1],
            ['name' => 'G', 'category' => 'Biên tập', 'work_coefficient' => 1.10, 'status' => 1],


            ['name' => 'A', 'category' => 'Đọc đính chính', 'work_coefficient' => 0.02, 'status' => 1],
            ['name' => 'B', 'category' => 'Đọc đính chính', 'work_coefficient' => 0.015, 'status' => 1],

                        
            ['name' => 'A', 'category' => 'Sửa bài', 'work_coefficient' => 0.03, 'status' => 1],
            ['name' => 'B', 'category' => 'Sửa bài', 'work_coefficient' => 0.025, 'status' => 1],


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