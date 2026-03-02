<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paper extends Model
{
    use HasFactory;
        protected $fillable = [
        'paper_coefficient',
        'paperSize',
    ];

    public function books()
    {
        return $this->hasMany(Book::class, 'paper_id');
    }
}
