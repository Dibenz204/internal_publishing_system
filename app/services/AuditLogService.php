<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuditLogService
{
    public function getLogs(array $filters = [])
    {
        $query = AuditLog::with('user')
            ->orderByDesc('created_at');


        if (!empty($filters['module'])) {
            $query->where('module', $filters['module']);
        }


        if (!empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }


        if (!empty($filters['method'])) {
            $query->where('method', strtoupper($filters['method']));
        }


        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['user_name'])) {
            $query->where('user_name', 'like', '%' . $filters['user_name'] . '%');
        }


        if (!empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }

        if (!empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }


        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($search) {
                $q->where('module', 'like', $search)
                    ->orWhere('action', 'like', $search)
                    ->orWhere('user_name', 'like', $search)
                    ->orWhere('method', 'like', $search)
                    ->orWhere('url', 'like', $search)
                    ->orWhere('record_id', 'like', $search);
            });
        }

        $perPage = $filters['per_page'] ?? 20;

        return $query->paginate($perPage);
    }


    public function getModules()
    {
        return AuditLog::select('module')
            ->distinct()
            ->orderBy('module')
            ->pluck('module');
    }


    public function getActions()
    {
        return AuditLog::select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');
    }


    public function getMethods()
    {
        return AuditLog::select('method')
            ->distinct()
            ->orderBy('method')
            ->whereNotNull('method')
            ->pluck('method');
    }


    public function getLogById(int $id)
    {
        return AuditLog::with('user')->findOrFail($id);
    }


    public function getStats(array $filters = [])
    {
        $query = AuditLog::query();

        if (!empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }

        if (!empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        if (!empty($filters['module'])) {
            $query->where('module', $filters['module']);
        }

        return [
            'total' => $query->count(),
            'by_action' => $query->selectRaw('action, count(*) as total')
                ->groupBy('action')
                ->get(),
            'by_module' => $query->selectRaw('module, count(*) as total')
                ->groupBy('module')
                ->get(),
            'by_method' => $query->selectRaw('method, count(*) as total')
                ->whereNotNull('method')
                ->groupBy('method')
                ->get(),
            'by_date' => $query->selectRaw('DATE(created_at) as date, count(*) as total')
                ->groupBy('date')
                ->orderByDesc('date')
                ->limit(30)
                ->get(),
        ];
    }

    /**
     * Xóa logs cũ (vd: logs > 90 ngày)
     */
    public function cleanOldLogs(int $days = 90): int
    {
        $cutoffDate = now()->subDays($days);

        return AuditLog::where('created_at', '<', $cutoffDate)->delete();
    }

    /**
     * Xóa logs theo module
     */
    public function deleteLogsByModule(string $module): int
    {
        return AuditLog::where('module', $module)->delete();
    }
}
