<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bookcategory extends Model
{
    use HasFactory;
        protected $fillable = [
        'name',
        'description',
        'status',
    ];

    public function books()
{
    return $this->belongsToMany(
        Book::class,
        'book_book_categories',
        'bookcategoryId',
        'bookId',
        'status',

    );
}

}
