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
        'finish_time',
        'status',
    ];

    public function books()
    {
        return $this->hasMany(Book::class, 'booktime_id');
    }
}
