<?php

use App\Http\Controllers\Api\BookController;
use Illuminate\Support\Facades\Route;

Route::prefix('books')->group(function () {

// Lấy danh sách tất cả sách
Route::get('/', [BookController::class, 'index']);

// Tìm kiếm sách
Route::get('/search', [BookController::class, 'search']);

// Lấy chi tiết 1 sách theo ID
Route::get('/{id}', [BookController::class, 'show']);

// Tạo mới sách
Route::post('/', [BookController::class, 'store']);

// Cập nhật toàn bộ thông tin sách
Route::put('/{id}', [BookController::class, 'update']);

// Cập nhật tiến độ đọc
Route::patch('/{id}/progress', [BookController::class, 'updateProgress']);

// Đánh dấu hoàn thành
Route::patch('/{id}/finish', [BookController::class, 'finish']);

// Hủy sách
Route::patch('/{id}/cancel', [BookController::class, 'cancel']);
});