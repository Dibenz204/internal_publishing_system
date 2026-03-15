<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Employee;
use App\Models\Paper;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $employee = Employee::first();
        $papers = Paper::all();

        if (!$employee || $papers->isEmpty()) {
            return;
        }

        $books = [
            ['name' => 'Toán cao cấp A1', 'bookCode' => 'MATH-A1-2024', 'page' => 250, 'status' => 1],
            ['name' => 'Giải tích 1', 'bookCode' => 'MATH-GT1-2024', 'page' => 320, 'status' => 1],
            ['name' => 'Giải tích 2', 'bookCode' => 'MATH-GT2-2024', 'page' => 300, 'status' => 1],
            ['name' => 'Đại số tuyến tính', 'bookCode' => 'MATH-DSTT-2024', 'page' => 280, 'status' => 1],
            ['name' => 'Xác suất thống kê', 'bookCode' => 'MATH-XSTK-2024', 'page' => 350, 'status' => 1],
            ['name' => 'Cơ sở lập trình', 'bookCode' => 'IT-CSLT-2024', 'page' => 280, 'status' => 0],
        ];

        $now = now();
        foreach ($books as $item) {
            Book::firstOrCreate(
                ['bookCode' => $item['bookCode']],
                [
                    'name' => $item['name'],
                    'page' => $item['page'],
                    'current_page' => 0,
                    'assigned_by' => $employee->id,
                    'paper_id' => $papers->random()->id,
                    'status' => $item['status'],
                    'start_time' => $now,
                ]
            );
        }
    }
}
