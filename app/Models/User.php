<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'email',
        'password',
        'status',
        'employee_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function isEmployee()
    {
        return $this->employee_id !== null;
    }

    public function getPositionAttribute()
    {
        return $this->employee?->position;
    }

    public function getPositionNameAttribute()
    {
        return $this->employee?->position?->name;
    }

    public function hasPosition($positionName)
    {
        return $this->employee &&
            $this->employee->position &&
            $this->employee->position->name === $positionName;
    }

    public function hasAnyPosition($positionNames)
    {
        if (!$this->employee || !$this->employee->position) {
            return false;
        }
        return in_array($this->employee->position->name, (array) $positionNames);
    }
}
