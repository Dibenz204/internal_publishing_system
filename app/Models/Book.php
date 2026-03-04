<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'bookCode',
        'page',
        'current_page',
        'note',
        'assigned_by',
        'paper_id',
        'status',
        'start_time',
        'end_time',
    ];

    public function assignedEmployee()
    {
        return $this->belongsTo(Employee::class, 'assigned_by');
    }

    public function categories()
    {
        return $this->belongsToMany(
            Bookcategory::class,
            'book_book_categories',
            'book_id',
            'bookcategory_id'
        )->withPivot('status')
            ->withTimestamps();
    }

    public function departments()
    {
        return $this->belongsToMany(
            Department::class,
            'projects',
            'book_id',
            'department_id'
        )->withPivot(['description', 'status'])
            ->withTimestamps();
    }

    public function paper()
    {
        return $this->belongsTo(Paper::class, 'paper_id');
    }

    public function transfers()
    {
        return $this->hasMany(BookTransfer::class, 'book_id');
    }
}
