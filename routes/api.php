<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Api\PositionController;

Route::middleware('auth:sanctum')->get('/debug-user', function (Request $request) {
    $user = $request->user();

    return response()->json([
        'user_id' => $user->id,
        'username' => $user->username,
        'position_direct' => $user->position ?? 'Không có',
        'positionName_attribute' => $user->positionName ?? 'Không có',
        'employee' => $user->employee,
        'all_attributes' => $user->toArray()
    ]);
});

Route::middleware('auth:sanctum')->get('/test', function (Request $request) {
    return response()->json([
        'user_id' => $request->user()->id,
        'username' => $request->user()->username
    ]);
});

Route::post('/login', [LoginController::class, 'apiLogin']);

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [LoginController::class, 'apiLogout']);
    Route::get('/check-auth', [LoginController::class, 'checkAuth']);

    // User info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });





    Route::middleware('position:Admin')->group(function () {
        require __DIR__ . '/api/positionRoute.php';
    });

    Route::middleware('position:Admin,Quản lý')->group(function () {
        require __DIR__ . '/api/employeeRoute.php';
        require __DIR__ . '/api/departmentRoute.php';
    });

    Route::middleware('position:Admin,Quản lý,Thủ thư')->group(function () {
        require __DIR__ . '/api/BookCategoryRoute.php';
    });
});
