<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\JobCategory;

class JobCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [

            ['name' => 'Biên tập 100%', 'category' => 'Biên tập', 'work_coefficient' => 0.25, 'status' => 1],
            ['name' => 'Biên tập 70%', 'category' => 'Biên tập', 'work_coefficient' => 1.00, 'status' => 1],
            ['name' => 'Biên tập 50%', 'category' => 'Biên tập', 'work_coefficient' => 1.20, 'status' => 1],
            ['name' => 'Biên tập 40%', 'category' => 'Biên tập', 'work_coefficient' => 2.00, 'status' => 1],


            ['name' => 'Đọc logic', 'category' => 'Đọc đính chính', 'work_coefficient' => 0.02, 'status' => 1],

            ['name' => 'Sửa bài', 'category' => 'Sửa bài', 'work_coefficient' => 0.03, 'status' => 1],
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
