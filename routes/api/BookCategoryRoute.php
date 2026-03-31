<?php

use App\Http\Controllers\API\BookCategoryController;
use Illuminate\Support\Facades\Route;

Route::prefix('book-categories')->group(function () {

    Route::get('/active', [BookCategoryController::class, 'active']);

    Route::middleware('position:Admin,Thư kí biên tập')->group(function () {

        Route::get('/', [BookCategoryController::class, 'index']);


        Route::get('/{id}', [BookCategoryController::class, 'show']);



        Route::post('/', [BookCategoryController::class, 'store']);

        Route::put('/{id}', [BookCategoryController::class, 'update']);



        Route::patch('/{id}/deactivate', [BookCategoryController::class, 'deactivate']);

        Route::patch('/{id}/activate', [BookCategoryController::class, 'activate']);
    });
});
