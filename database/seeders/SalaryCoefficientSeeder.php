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
                'salary_per_paper' => 10
            ],
            [
                'year' => 2024,
                'salary_per_paper' => 12
            ],
            [
                'year' => 2025,
                'salary_per_paper' => 14
            ],
            [
                'year' => 2026,
                'salary_per_paper' => 15
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