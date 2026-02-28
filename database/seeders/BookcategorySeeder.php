<?php

namespace Database\Seeders;

use App\Models\Bookcategory;
use Illuminate\Database\Seeder;

class BookcategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Sách giáo khoa', 'description' => 'Sách dùng trong chương trình giáo dục phổ thông', 'status' => true],
            ['name' => 'Sách tham khảo', 'description' => 'Sách tham khảo cho học sinh, sinh viên', 'status' => true],
            ['name' => 'Văn học', 'description' => 'Tiểu thuyết, truyện ngắn, thơ', 'status' => true],
            ['name' => 'Kinh tế - Kỹ năng', 'description' => 'Sách kinh doanh, kỹ năng sống', 'status' => true],
            ['name' => 'Thiếu nhi', 'description' => 'Sách dành cho độ tuổi thiếu nhi', 'status' => true],
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
