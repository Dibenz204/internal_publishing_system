<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobCategory extends Model
{
    protected $fillable = [
        'name',
        'work_coefficient',
        'category',
        'status',
        'expired_at'
    ];

    public function allocations()
    {
        return $this->hasMany(Allocation::class, 'job_category_id');
    }
}
