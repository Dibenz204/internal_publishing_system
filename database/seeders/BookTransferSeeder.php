<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BookTransfer;
use App\Models\Employee;
use Illuminate\Database\Seeder;

class BookTransferSeeder extends Seeder
{
    public function run(): void
    {
        $books = Book::limit(10)->get();
        $employees = Employee::all();

        if ($books->count() < 2 || $employees->count() < 2) {
            $this->command->warn('Cần ít nhất 2 books và 2 employees để tạo book transfer.');
            return;
        }

        $notes = [
            'Chuyển giao biên tập cho phòng tiếp theo.',
            'Hoàn thành đọc đính chính, chuyển sang sửa bài.',
            'Phân công lại theo chỉ đạo trưởng phòng.',
            'Chuyển công việc do điều chỉnh kế hoạch.',
            'Bàn giao bản thảo đã biên tập xong.',
        ];

        $count = 0;
        foreach ($books as $book) {
            $from = $employees->random();
            $to = $employees->where('id', '!=', $from->id)->random();
            $start = now()->subDays(rand(5, 60));
            $end = rand(0, 1) ? $start->copy()->addDays(rand(1, 10)) : null;

            BookTransfer::firstOrCreate(
                [
                    'book_id' => $book->id,
                    'from_employee_id' => $from->id,
                    'to_employee_id' => $to->id,
                    'start_time' => $start->format('Y-m-d H:i:s'),
                ],
                [
                    'end_time' => $end?->format('Y-m-d H:i:s'),
                    'note' => $notes[$count % count($notes)],
                    'status' => 1,
                ]
            );
            $count++;

            // Một số sách có thêm 1 lần chuyển nữa (người nhận chuyển tiếp)
            if ($count % 3 === 0 && $employees->count() >= 3) {
                $nextTo = $employees->whereNotIn('id', [$from->id, $to->id])->random();
                BookTransfer::firstOrCreate(
                    [
                        'book_id' => $book->id,
                        'from_employee_id' => $to->id,
                        'to_employee_id' => $nextTo->id,
                        'start_time' => ($end ? $end->copy() : $start->copy()->addDay())->format('Y-m-d H:i:s'),
                    ],
                    [
                        'end_time' => null,
                        'note' => 'Chuyển tiếp theo quy trình.',
                        'status' => 1,
                    ]
                );
            }
        }

        $this->command->info('Đã seed ' . BookTransfer::count() . ' book transfers.');
    }
}