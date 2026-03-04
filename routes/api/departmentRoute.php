<?php

use App\Http\Controllers\Api\DepartmentController;
use Illuminate\Support\Facades\Route;

Route::prefix('departments')->group(function () {


    Route::get('/', [DepartmentController::class, 'index'])
        ->middleware('position:Admin,HR');

    Route::middleware('position:Admin')->group(function () {

        Route::get('/{id}', [DepartmentController::class, 'show']);

        Route::post('/', [DepartmentController::class, 'store']);

        Route::patch('/{id}', [DepartmentController::class, 'update']);

        Route::patch('/{id}/activate', [DepartmentController::class, 'activate']);

        Route::patch('/{id}/deactivate', [DepartmentController::class, 'deactivate']);
    });
});
