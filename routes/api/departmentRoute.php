<?php

use App\Http\Controllers\Api\DepartmentController;
use Illuminate\Support\Facades\Route;

Route::prefix('departments')->group(function () {


    Route::get('/', [DepartmentController::class, 'index'])
        ->middleware('position:Admin,Thư kí biên tập,HR,Trưởng phòng');

    Route::middleware('position:Admin,Thư kí biên tập,HR,Trưởng phòng')->group(function () {

        Route::get('/{id}', [DepartmentController::class, 'show']);

        Route::get('/{id}/employees', [DepartmentController::class, 'getEmployees']);

        Route::post('/', [DepartmentController::class, 'store']);

        Route::patch('/{id}', [DepartmentController::class, 'update']);

        Route::patch('/{id}/activate', [DepartmentController::class, 'activate']);

        Route::patch('/{id}/deactivate', [DepartmentController::class, 'deactivate']);
    });
});
