<?php

namespace Database\Seeders;

use App\Models\Allocation;
use App\Models\Report;
use App\Models\SalaryCoefficient;
use Illuminate\Database\Seeder;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        $allocations = Allocation::with(['project.book.paper', 'jobCategory'])->get();
        $salaryCoefficients = SalaryCoefficient::all()->keyBy('year');

        if ($allocations->isEmpty() || $salaryCoefficients->isEmpty()) {
            $this->command->warn('Need allocations and salary_coefficients first.');
            return;
        }

        $months = [
            ['month' => 1, 'year' => 2025],
            ['month' => 2, 'year' => 2025],
            ['month' => 3, 'year' => 2025],
            ['month' => 6, 'year' => 2025],
            ['month' => 9, 'year' => 2025],
            ['month' => 12, 'year' => 2025],
            ['month' => 1, 'year' => 2026],
            ['month' => 2, 'year' => 2026],
        ];

        $count = 0;

        foreach ($allocations as $allocation) {
            $book = $allocation->project?->book;
            $paper = $book?->paper;
            $jobCategory = $allocation->jobCategory;

            if (!$book || !$paper || !$jobCategory) {
                continue;
            }

            $completedPage = $allocation->completed_page ?? 0;
            if ($completedPage <= 0) {
                continue;
            }

            $paperCoefficient = (float) $paper->paper_coefficient;
            $workCoefficient = (float) $jobCategory->work_coefficient;

            // trang quy đổi = số trang hoàn thành * hệ số khổ * hệ số công việc
            $conversionPage = round($completedPage * $paperCoefficient * $workCoefficient, 2);

            // Mỗi allocation → 1-2 tháng report ngẫu nhiên
            $selectedMonths = collect($months)->random(rand(1, 2));

            foreach ($selectedMonths as $period) {
                $salaryCoef = $salaryCoefficients->get($period['year']);
                if (!$salaryCoef) {
                    $salaryCoef = $salaryCoefficients->last();
                }

                $salary = round($conversionPage * (float) $salaryCoef->salary_per_paper, 2);

                Report::firstOrCreate(
                    [
                        'allocation_id' => $allocation->id,
                        'project_id' => $allocation->project_id,
                        'report_year' => $period['year'],
                        'report_month' => $period['month'],
                    ],
                    [
                        'salary_coefficient_id' => $salaryCoef->id,
                        'conversion_page' => $conversionPage,
                        'salary' => $salary,
                        'note' => null,
                        'status' => 1,
                    ]
                );
                $count++;
            }
        }

        $this->command->info("Seeded {$count} reports.");
    }
}
