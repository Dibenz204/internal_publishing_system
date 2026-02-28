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
        $books = Book::limit(2)->get();
        $employees = Employee::all();

        if ($books->isEmpty() || $employees->count() < 2) {
            return;
        }

        $now = now();

        foreach ($books as $book) {
            $from = $employees->random();
            $to = $employees->where('id', '!=', $from->id)->random();

            BookTransfer::create([
                'book_id' => $book->id,
                'from_employee_id' => $from->id,
                'to_employee_id' => $to->id,
                'start_time' => $now->copy()->subDays(5),
                'status' => 1, // PROCESSING
                'end_time' => null,
            ]);
        }
    }
}
