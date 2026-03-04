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
        'department_id',
        'position_id',
        'status',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function assignedBooks()
    {
        return $this->hasMany(Book::class, 'assigned_by');
    }

    public function user()
    {
        return $this->hasOne(User::class, 'employee_id');
    }

    public function position()
    {
        return $this->belongsTo(Position::class, 'position_id');
    }

    public function transfersFrom()
    {
        return $this->hasMany(BookTransfer::class, 'from_employee_id');
    }

    public function transfersTo()
    {
        return $this->hasMany(BookTransfer::class, 'to_employee_id');
    }
}
