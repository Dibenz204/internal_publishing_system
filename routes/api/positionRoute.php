<?php

use App\Http\Controllers\Api\PositionController;
use Illuminate\Support\Facades\Route;

Route::prefix('positions')->group(function () {

    // Lấy danh sách tất hoặc theo tên
    Route::get('/', [PositionController::class, 'index'])
        ->middleware('position:Admin,Nhân viên');

    Route::middleware('position:Admin')->group(function () {
        // Tạo mới
        Route::post('/', [PositionController::class, 'store']);

        // Cập nhật theo name
        Route::patch('/{id}', [PositionController::class, 'update']);

        // Bật position
        Route::patch('/{id}/activate', [PositionController::class, 'activate']);

        // Tắt position
        Route::patch('/{id}/deactivate', [PositionController::class, 'deactivate']);
    });
});
