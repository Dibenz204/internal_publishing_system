<?php
use App\Http\Controllers\Api\BookCategoryController;
use Illuminate\Support\Facades\Route;

Route::prefix('book-categories')->group(function () {
    Route::get('/', [BookCategoryController::class, 'index']);
    Route::get('/active', [BookCategoryController::class, 'active']);
    Route::get('/{id}', [BookCategoryController::class, 'show']);

    Route::post('/', [BookCategoryController::class, 'store']);
    Route::put('/{id}', [BookCategoryController::class, 'update']);

    Route::patch('/{id}/deactivate', [BookCategoryController::class, 'deactivate']);
    Route::patch('/{id}/activate', [BookCategoryController::class, 'activate']);
});