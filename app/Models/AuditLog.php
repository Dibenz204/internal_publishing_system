<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = true;
    protected $fillable = [
        'user_id',
        'user_name',
        'user_position',
        'action',
        'module',
        'record_id',
        'old_data',
        'new_data',
        'ip_address',
        'user_agent',
        'method',
        'url'
    ];

    protected $casts = [
        'old_data' => 'array',
        'new_data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scope lọc theo module
    public function scopeModule($query, $module)
    {
        return $query->where('module', $module);
    }

    // Scope lọc theo action
    public function scopeAction($query, $action)
    {
        return $query->where('action', $action);
    }
}
