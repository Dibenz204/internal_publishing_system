<?php

namespace App\Services;

use App\Models\SalaryCoefficient;

class SalaryCoefficientService
{

    public function getAll()
    {
        return SalaryCoefficient::orderBy('year', 'desc')->get();
    }

    public function create($data)
    {

        SalaryCoefficient::query()->update([
            'status' => 0
        ]);

        return SalaryCoefficient::create([
            'year' => $data['year'],
            'salary_per_paper' => $data['salary_per_paper'],
            'status' => 1
        ]);
    }


    public function disable($id)
    {
        $salary = SalaryCoefficient::findOrFail($id);

        $salary->status = 0;
        $salary->save();

        return $salary;
    }


    public function enable($id)
    {

        SalaryCoefficient::query()->update([
            'status' => 0
        ]);

        $salary = SalaryCoefficient::findOrFail($id);

        $salary->status = 1;
        $salary->save();

        return $salary;
    }
}
