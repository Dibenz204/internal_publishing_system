<?php

use App\Http\Controllers\Api\SalaryCoefficientController;
use Illuminate\Support\Facades\Route;

Route::prefix('salary-coefficients')->group(function () {

    Route::middleware('position:Admin,Kế toán')->group(function () {

        // 4. Lấy tất cả
        Route::get('/', [SalaryCoefficientController::class, 'getAll']);

        // 1. Tạo hệ số lương
        Route::post('/', [SalaryCoefficientController::class, 'create']);
    });
});
