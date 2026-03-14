<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Project;
use App\Models\Book;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $books = Book::all();
        $departments = Department::where('status', 1)->get();

        if ($books->isEmpty() || $departments->isEmpty()) {
            return;
        }

        $descriptions = [
            'Biên tập bản thảo',
            'Đọc đính chính lần 1',
            'Sửa bài theo góp ý',
            'Biên tập hoàn thiện',
            'Đọc đính chính lần 2',
        ];

        foreach ($books as $index => $book) {
            // Mỗi book có 1 hoặc 2 project (tùy department)
            $deptCount = ($index % 2 === 0) ? 2 : 1;
            foreach ($departments->take($deptCount) as $d => $department) {
                $desc = $descriptions[($index + $d) % count($descriptions)];
                Project::firstOrCreate(
                    [
                        'book_id' => $book->id,
                        'department_id' => $department->id,
                    ],
                    [
                        'description' => $desc . ' - ' . $book->name,
                        'status' => 1,
                    ]
                );
            }
        }
    }
}