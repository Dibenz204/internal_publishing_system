<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'status',
        'managerId',
    ];

    public function manager()
    {
        return $this->belongsTo(Employee::class, 'managerId');
    }
}
