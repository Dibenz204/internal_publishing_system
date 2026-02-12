<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'birthday',
        'sex',
        'status',
        'department_id',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function assignedBooks()
    {
        return $this->hasMany(Book::class, 'assigned_by');
    }

    public function users()
    {
        return $this->hasOne(User::class, 'employee_id');
    }

    public function positions()
    {
        return $this->belongsToMany(
            Position::class,
            'position_employee',
            'employee_id',
            'position_id'
        )->withPivot(['description', 'status'])
         ->withTimestamps();
    }
}
