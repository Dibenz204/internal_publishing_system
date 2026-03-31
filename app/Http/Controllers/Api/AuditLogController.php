<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuditLogController extends Controller
{
    protected $auditLogService;

    public function __construct(AuditLogService $auditLogService)
    {
        $this->auditLogService = $auditLogService;
    }

    /**
     * Lấy danh sách logs
     */
    public function index(Request $request)
    {
        try {
            $filters = $request->only([
                'module',
                'action',
                'method',
                'user_id',
                'user_name',
                'from_date',
                'to_date',
                'search',
                'per_page'
            ]);

            $logs = $this->auditLogService->getLogs($filters);

            return response()->json([
                'success' => true,
                'data' => $logs->items(),
                'meta' => [
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy chi tiết một log
     */
    public function show($id)
    {
        try {
            $log = $this->auditLogService->getLogById($id);

            return response()->json([
                'success' => true,
                'data' => $log
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy log'
            ], 404);
        }
    }

    /**
     * Lấy danh sách các module
     */
    public function getModules()
    {
        try {
            $modules = $this->auditLogService->getModules();

            return response()->json([
                'success' => true,
                'data' => $modules
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách các action
     */
    public function getActions()
    {
        try {
            $actions = $this->auditLogService->getActions();

            return response()->json([
                'success' => true,
                'data' => $actions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách các method
     */
    public function getMethods()
    {
        try {
            $methods = $this->auditLogService->getMethods();

            return response()->json([
                'success' => true,
                'data' => $methods
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy thống kê logs
     */
    public function getStats(Request $request)
    {
        try {
            $filters = $request->only(['from_date', 'to_date', 'module']);
            $stats = $this->auditLogService->getStats($filters);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa logs cũ
     */
    public function cleanOldLogs(Request $request)
    {
        try {
            $days = $request->input('days', 90);
            $deleted = $this->auditLogService->cleanOldLogs($days);

            return response()->json([
                'success' => true,
                'message' => "Đã xóa {$deleted} logs cũ hơn {$days} ngày"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
