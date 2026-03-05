<?php

namespace Database\Seeders;

use App\Models\Bookcategory;
use Illuminate\Database\Seeder;

class BookcategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Sách giáo khoa', 'description' => 'Sách dùng trong chương trình giáo dục phổ thông', 'status' => 1],
            ['name' => 'Sách tham khảo', 'description' => 'Sách tham khảo cho học sinh, sinh viên', 'status' => 1],
            ['name' => 'Khoa học viễn tưởng', 'description' => 'Sách giả tưởng về thế giới trong tưởng lai ', 'status' => 0],
            ['name' => 'Thiếu nhi', 'description' => 'Sách dành cho độ tuổi thiếu nhi', 'status' => 1],
        ];

        foreach ($categories as $item) {
            Bookcategory::firstOrCreate(
                ['name' => $item['name']],
                [
                    'description' => $item['description'],
                    'status' => $item['status'],
                ]
            );
        }
    }
}
