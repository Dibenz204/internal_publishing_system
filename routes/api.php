<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;

Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json(['message' => 'CSRF cookie set']);
})->middleware('web');

Route::post('/login', [LoginController::class, 'apiLogin'])->middleware('web');


//Protected Api
Route::middleware('auth', 'web')->group(function () {

    // Auth
    Route::post('/logout', [LoginController::class, 'apiLogout']);
    Route::get('/check-auth', [LoginController::class, 'checkAuth']);

    // User info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    //Dùng để debug cho phiên đăng nhập bằng session
    Route::get('/debug-session', function (Request $request) {
        return response()->json([
            'session_id' => session()->getId(),
            'user_id' => auth()->id(),
            'user' => auth()->user(),
            'session_data' => $request->session()->all()
        ]);
    });


    // Phân quyền theo position
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
