<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    use HasFactory;

    protected $fillable = [
        'username',
        'password',
        'status',
        'employeeId',
    ];

    // 1 acc thuoc ve 1 employee
    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employeeId');
    }
}
