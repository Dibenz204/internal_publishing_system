<?php

use App\Http\Controllers\Api\JobCategoryController;
use Illuminate\Support\Facades\Route;

Route::prefix('job-categories')->group(function () {

    Route::middleware('position:Admin,HR')->group(function () {

        // Lấy tất cả
        Route::get('/', [JobCategoryController::class, 'getAll']);

        // Lấy những cái đang hoạt động
        Route::get('/active', [JobCategoryController::class, 'getActive']);

        // Tạo mới
        Route::post('/', [JobCategoryController::class, 'create']);

        // Cập nhật name
        Route::patch('/{id}/update-name', [JobCategoryController::class, 'updateName']);

        // Tắt trạng thái
        Route::patch('/{id}/deactivate', [JobCategoryController::class, 'disable']);
    });
});
