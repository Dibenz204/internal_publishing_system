<?php

use App\Http\Controllers\API\AuditLogController;
use Illuminate\Support\Facades\Route;

Route::prefix('audit-logs')->group(function () {
    Route::get('/', [AuditLogController::class, 'index']);
    Route::get('/modules', [AuditLogController::class, 'getModules']);
    Route::get('/actions', [AuditLogController::class, 'getActions']);
    Route::get('/stats', [AuditLogController::class, 'getStats']);
    Route::get('/{id}', [AuditLogController::class, 'show']);
    Route::delete('/clean', [AuditLogController::class, 'cleanOldLogs']);
});
