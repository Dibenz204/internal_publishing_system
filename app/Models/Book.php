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
        'assignedBy',
        'booktimeId',
    ];

    public function assignedEmployee()
    {
        return $this->belongsTo(Employee::class, 'assignedBy');
    }

    public function booktime()
    {
        return $this->belongsTo(Booktime::class, 'booktimeId');
    }
    
    public function categories()
{
    return $this->belongsToMany(
        Bookcategory::class,
        'book_book_categories',
        'bookId',
        'bookcategoryId',
        'status',
    );
}

}
