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
        'status',
        'departmentId',
        'positionId',
    ];
    public function department()
{
    return $this->belongsTo(Department::class, 'departmentId');
}

    public function managedDepartment()
{
    return $this->hasOne(Department::class, 'managerId');
}

    public function assignedBooks()
{
    return $this->hasMany(Book::class, 'assignedBy');
}

    public function account()
{
    return $this->hasOne(Account::class, 'employeeId');
}

public function positions()
{
    return $this->belongsToMany(
        Position::class,
        'position_employee',
        'employeeId',
        'positionId'
    )->withPivot(['description', 'status'])
     ->withTimestamps();
}

}
