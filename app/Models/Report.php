<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'allocation_id',
        'project_id',
        'salary_coefficient_id',
        'conversion_page',
        'salary',
        'note',
        'report_month',
        'report_year',
        'status',
    ];

    public function allocation()
    {
        return $this->belongsTo(Allocation::class, 'allocation_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function salaryCoefficient()
    {
        return $this->belongsTo(SalaryCoefficient::class, 'salary_coefficient_id');
    }
}
