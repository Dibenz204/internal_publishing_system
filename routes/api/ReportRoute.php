<?php

use App\Http\Controllers\Api\ReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('reports')->group(function () {

    //lấy toàn bộ
    Route::get('/', [ReportController::class, 'index']);

    //theo phòng ban
    Route::get('/department/{departmentId}', [ReportController::class, 'byDepartment']);

    //theo cá nhân
    Route::get('/employee/{employeeId}', [ReportController::class, 'byEmployee']);
});
