<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ReportController;

Route::prefix('reports')->group(function () {

    Route::get('/departments', [ReportController::class, 'departmentSummary']);

    Route::get('/departments/{departmentId}/employees', [ReportController::class, 'employeeSummary']);

    Route::get('/departments/{departmentId}/employees/{employeeId}/details', [ReportController::class, 'employeeDetail']);
});
