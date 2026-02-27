<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectController;

/*
PROJECT ROUTES

*/

Route::prefix('projects')->group(function () {

// 1. Accept project (1 -> 2)
Route::patch('{id}/accept', [ProjectController::class, 'accept']);

// 2. Cancel project (1 -> 0)
Route::patch('{id}/cancel', [ProjectController::class, 'cancel']);

// 3. Complete project (2 -> 3)
Route::patch('{id}/complete', [ProjectController::class, 'complete']);

// 4. Search project
Route::get('search', [ProjectController::class, 'search']);

// 5. Books not assigned
Route::get('books-not-assigned', [ProjectController::class, 'booksNotAssigned']);

// 6. Assign book to multiple departments
Route::post('assign', [ProjectController::class, 'assign']);
});