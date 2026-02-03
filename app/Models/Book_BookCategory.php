<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book_BookCategory extends Model
{
    use HasFactory;
      protected $fillable = [
        'employeeId',
        'bookcategoryId',
    ];
}
