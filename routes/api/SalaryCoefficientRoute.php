<?php

use App\Http\Controllers\Api\SalaryCoefficientController;
use Illuminate\Support\Facades\Route;

Route::prefix('salary-coefficients')->group(function () {

    // 1. Tạo hệ số lương
    Route::post('/', [SalaryCoefficientController::class, 'create']);

    // 2. Tắt trạng thái (1 -> 0)
    Route::patch('{id}/deactivate', [SalaryCoefficientController::class, 'disable']);

    // 3. Bật trạng thái (0 -> 1)
    Route::patch('{id}/activate', [SalaryCoefficientController::class, 'enable']);

    // 4. Lấy tất cả
    Route::get('/', [SalaryCoefficientController::class, 'getAll']);


});