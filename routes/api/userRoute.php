<?php

use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('users')->group(function () {

    Route::get('/', [UserController::class, 'index']);

    // theo tên nhân viên
    Route::get('/search', [UserController::class, 'search']);

    // theo email/phone
    Route::post('/forgot-password', [UserController::class, 'forgotPassword'])
        ->middleware('position:Admin,Quản lý');

    // đặt lại pw
    Route::post('/reset-password', [UserController::class, 'resetPassword'])
        ->middleware('position:Admin,Quản lý');

    // Cập nhật thông tin user
    Route::put('/{id}', [UserController::class, 'update']);

    // đổi pw
    Route::put('/{id}/change-password', [UserController::class, 'changePassword'])->name('users.change-password');
});
