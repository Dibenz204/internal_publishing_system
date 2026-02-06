<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booktime extends Model
{
    use HasFactory;
        protected $fillable = [
        'starttime',
        'endtime',
        'actual_finish_time',
        'status',
    ];

    public function books()
    {
        return $this->hasMany(Book::class, 'booktimeId');
    }

}
