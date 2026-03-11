<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'status',
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class, 'department_id');
    }

    public function books()
    {
        return $this->belongsToMany(
            Book::class,
            'projects',
            'department_id',
            'book_id'
        )->withPivot(['description', 'status'])
            ->withTimestamps();
    }
}
