<?php

namespace App\Services;

use App\Models\SalaryCoefficient;

class SalaryCoefficientService
{
    /**
     * Lấy tất cả hệ số lương
     */
    public function getAll()
    {
        return SalaryCoefficient::orderBy('year', 'desc')->get();
    }


    /**
     * Tạo hệ số lương
     */
    public function create($data)
    {
        // tắt tất cả hệ số cũ
        SalaryCoefficient::query()->update([
            'status' => 0
        ]);

        return SalaryCoefficient::create([
            'year' => $data['year'],
            'salary_per_paper' => $data['salary_per_paper'],
            'status' => 1
        ]);
    }

    /**
     * Tắt trạng thái (Ngưng sử dụng)
     */
    public function disable($id)
    {
        $salary = SalaryCoefficient::findOrFail($id);

        $salary->status = 0;
        $salary->save();

        return $salary;
    }

    /**
     * Bật trạng thái (Đang sử dụng)
     */
    public function enable($id)
    {
        // tắt tất cả hệ số khác
        SalaryCoefficient::query()->update([
            'status' => 0
        ]);

        $salary = SalaryCoefficient::findOrFail($id);

        $salary->status = 1;
        $salary->save();

        return $salary;
    }
}