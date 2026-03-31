<?php

namespace App\Services;

use App\Models\SalaryCoefficient;
use App\Traits\LogsActivity;

class SalaryCoefficientService
{
    use LogsActivity;

    public function getAll()
    {
        return SalaryCoefficient::orderBy('year', 'desc')->get();
    }

    public function create($data)
    {

        SalaryCoefficient::query()->update([
            'status' => 0
        ]);

        $salary = SalaryCoefficient::create([
            'year' => $data['year'],
            'salary_per_paper' => $data['salary_per_paper'],
            'status' => 1
        ]);

        $this->logCreate('salary', $salary->id, $salary->toArray());
    }
}
