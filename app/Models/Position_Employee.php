<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PositionEmployee extends Model
{
    use HasFactory;

    protected $table = 'position_employee';

    protected $fillable = [
        'employeeId',
        'positionId',
        'description',
        'status',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employeeId');
    }

    public function position()
    {
        return $this->belongsTo(Position::class, 'positionId');
    }
}
