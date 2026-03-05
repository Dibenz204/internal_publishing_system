<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookTransfer extends Model
{
    protected $fillable = [
        'book_id',
        'from_employee_id',
        'to_employee_id',
        'start_time',
        'end_time',
        'note',
        'status',
    ];


    public function book()
    {
        return $this->belongsTo(Book::class, 'book_id');
    }


    public function fromEmployee()
    {
        return $this->belongsTo(Employee::class, 'from_employee_id');
    }


    public function toEmployee()
    {
        return $this->belongsTo(Employee::class, 'to_employee_id');
    }
}
