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
        'bookSize',
        'status',
        'assigned_by',
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
}
