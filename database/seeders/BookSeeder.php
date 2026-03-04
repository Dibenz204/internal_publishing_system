<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Bookcategory;
use App\Models\Employee;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();
        if ($employees->isEmpty()) {
            return;
        }

        $books = [
            [
                'name' => 'Toán học 10 - Tập 1',
                'bookCode' => 'TH10-001',
                'page' => 180,
                'current_page' => 0,
                'bookSize' => '17x24',
                'status' => 1, // PROCESSING
            ],
            [
                'name' => 'Ngữ văn 11 - Tập 2',
                'bookCode' => 'NV11-002',
                'page' => 220,
                'current_page' => 50,
                'bookSize' => '17x24',
                'status' => 1,
            ],
            [
                'name' => 'Kỹ năng giao tiếp hiệu quả',
                'bookCode' => 'KN-003',
                'page' => 250,
                'current_page' => 0,
                'bookSize' => '14x20',
                'status' => 2, // PENDING
            ],
            [
                'name' => 'Truyện cổ tích Việt Nam',
                'bookCode' => 'TN-004',
                'page' => 120,
                'current_page' => 120,
                'bookSize' => '14x20',
                'status' => 3, // COMPLETED
            ],
        ];

        $now = now();

        foreach ($books as $index => $item) {
            $assignedBy = $employees->get($index % $employees->count());
            $book = Book::firstOrCreate(
                ['bookCode' => $item['bookCode']],
                [
                    'name' => $item['name'],
                    'page' => $item['page'],
                    'current_page' => $item['current_page'],
                    'bookSize' => $item['bookSize'],
                    'status' => $item['status'],
                    'assigned_by' => $assignedBy->id,
                    'start_time' => $now,
                ]
            );

            // Gắn 1 category cho mỗi sách (pivot)
            $category = Bookcategory::inRandomOrder()->first();
            if ($category && !$book->categories()->where('bookcategory_id', $category->id)->exists()) {
                $book->categories()->attach($category->id, ['status' => 'active']);
            }
        }
    }
}
