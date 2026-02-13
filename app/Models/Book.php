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
        'currentPage',
        'bookSize',
        'status',
        'assigned_by',
        'booktime_id',
    ];

    public function assignedEmployee()
    {
        return $this->belongsTo(Employee::class, 'assigned_by');
    }

    public function booktime()
    {
        return $this->belongsTo(Booktime::class, 'booktime_id');
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
