<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'department_id',
        'description',
        'status',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function book()
    {
        return $this->belongsTo(Book::class, 'book_id');
    }

    public function allocations()
    {
    return $this->hasMany(Allocation::class, 'project_id');
    }
}

