<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\DB;

Route::post('/login', [LoginController::class, 'apiLogin']);
// ->middleware('web');

Route::get('/ping', function () {
    try {
        DB::connection()->getPdo();
        return response()->json(['status' => 'ok', 'db' => 'connected']);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'db' => $e->getMessage()]);
    }
});

Route::get('/check-auth-debug', function (Request $request) {
    try {
        return response()->json([
            'authenticated' => auth()->check(),
            'user' => auth()->user(),
            'session_id' => session()->getId(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ]);
    }
});

//Protected Api
// Route::middleware('auth', 'web')->group(function () {
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [LoginController::class, 'apiLogout']);
    Route::get('/check-auth', [LoginController::class, 'checkAuth']);

    // User info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/debug-session', function (Request $request) {
        return response()->json([
            'session_id' => session()->getId(),
            'user_id' => auth()->id(),
            'user' => auth()->user(),
            'session_data' => $request->session()->all()
        ]);
    });


    require __DIR__ . '/api/positionRoute.php';
    require __DIR__ . '/api/employeeRoute.php';
    require __DIR__ . '/api/departmentRoute.php';
    require __DIR__ . '/api/BookCategoryRoute.php';
    require __DIR__ . '/api/BookRoute.php';
    require __DIR__ . '/api/ProjectRoute.php';
    require __DIR__ . '/api/BookTransferRoute.php';
    require __DIR__ . '/api/PaperRoute.php';
    require __DIR__ . '/api/userRoute.php';
    require __DIR__ . '/api/SalaryCoefficientRoute.php';
    require __DIR__ . '/api/JobCategoryRoute.php';
    require __DIR__ . '/api/TruongPhongBookRoute.php';
    require __DIR__ . '/api/ReportRoute.php';
    require __DIR__ . '/api/AllocationRoute.php';
    require __DIR__ . '/api/AuditLogRoute.php';
});
