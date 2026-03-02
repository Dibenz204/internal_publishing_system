<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;
        protected $fillable = [
        'description',
        'status',
        'department_id',
        'book_id',
    ];
        public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

        public function book()
    {
        return $this->belongsTo(Book::class, 'book_id');
    }
}
