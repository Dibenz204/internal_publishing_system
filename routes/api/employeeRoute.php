<?php

use App\Http\Controllers\Api\EmployeeController;
use Illuminate\Support\Facades\Route;

Route::prefix('employees')->group(function () {

    Route::get('/', [EmployeeController::class, 'index']);
    Route::get('/active', [EmployeeController::class, 'active']);

    Route::get('/search', [EmployeeController::class, 'search']);

    Route::post('/', [EmployeeController::class, 'store']);
    Route::put('/{id}', [EmployeeController::class, 'update']);
    Route::patch('/{id}/deactivate', [EmployeeController::class, 'deactivate']);
    Route::patch('/{id}/activate', [EmployeeController::class, 'activate']);
    Route::get('/{id}', [EmployeeController::class, 'show'])
        ->whereNumber('id');
});