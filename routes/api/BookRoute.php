<?php

use App\Http\Controllers\API\BookController;
use Illuminate\Support\Facades\Route;

Route::prefix('books')->group(function () {

    // VÌ ĐANG CÒN TEST, NÊN CÓ THỂ SỬ DỤNG ADMIN ADD SÁCH
    Route::middleware('position:Admin,Thư kí biên tập')->group(function () {

        // Tạo mới sách
        Route::post('/', [BookController::class, 'store']);

        // Cập nhật toàn bộ thông tin sách
        Route::put('/{id}', [BookController::class, 'update']);

        // Đánh dấu hoàn thành
        Route::patch('/{id}/finish', [BookController::class, 'finish']);

        // Hủy sách
        Route::patch('/{id}/cancel', [BookController::class, 'cancel']);
    });


    // Lấy danh sách tất cả sách
    Route::get('/', [BookController::class, 'index']);

    // Tìm kiếm sách
    Route::get('/search', [BookController::class, 'search']);

    // Lấy chi tiết 1 sách theo ID
    Route::get('/{id}', [BookController::class, 'show']);
});
