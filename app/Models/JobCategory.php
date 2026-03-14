<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobCategory extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'name',
        'work_coefficient',
        'category',
        'status'
    ];

    public function allocations()
    {
    return $this->hasMany(Allocation::class, 'job_category_id');
    }
}