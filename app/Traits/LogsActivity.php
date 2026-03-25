<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Request;

trait LogsActivity
{
    public function logActivity(
        string $action,
        string $module,
        $recordId = null,
        $oldData = null,
        $newData = null
    ) {
        $user = auth()->user();

        AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->username,
            'user_position' => $user?->positionName,
            'action' => $action,
            'module' => $module,
            'record_id' => $recordId,
            'old_data' => $oldData,
            'new_data' => $newData,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'method' => Request::method(),
            'url' => Request::fullUrl(),
        ]);
    }

    public function logCreate($module, $recordId, $data)
    {
        $this->logActivity('create', $module, $recordId, null, $data);
    }

    public function logUpdate($module, $recordId, $oldData, $newData)
    {
        $this->logActivity('update', $module, $recordId, $oldData, $newData);
    }

    public function logDelete($module, $recordId, $data)
    {
        $this->logActivity('delete', $module, $recordId, $data, null);
    }

    public function logView($module, $recordId = null, $data = null)
    {
        $this->logActivity('view', $module, $recordId, null, $data);
    }
}
