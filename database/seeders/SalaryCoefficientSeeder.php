<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SalaryCoefficient;

class SalaryCoefficientSeeder extends Seeder
{
    public function run(): void
    {
        $coefficients = [
            [
                'year' => 2023,
                'salary_per_paper' => 10,
                'status' => 0
            ],
            [
                'year' => 2024,
                'salary_per_paper' => 12,
                'status' => 0
            ],
            [
                'year' => 2025,
                'salary_per_paper' => 14,
                'status' => 0
            ],
            [
                'year' => 2026,
                'salary_per_paper' => 15,
                'status' => 1
            ]
        ];

        foreach ($coefficients as $item) {
            SalaryCoefficient::updateOrCreate(
                ['year' => $item['year']],
                $item
            );
        }
    }
}
