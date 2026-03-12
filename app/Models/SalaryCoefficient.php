<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalaryCoefficient extends Model
{
    protected $fillable = [
        'year',
        'salary_per_paper',
        'status',
    ];

    public function reports()
    {
        return $this->hasMany(Report::class, 'salary_coefficient_id');
    }
}
