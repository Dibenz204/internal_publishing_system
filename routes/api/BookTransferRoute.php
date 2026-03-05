<?php

use App\Http\Controllers\Api\BookTransferController;
use Illuminate\Support\Facades\Route;

Route::prefix('books')->group(function () {

    // Lấy danh sách transfer của book
    Route::get('/{id}/transfers', [BookTransferController::class, 'index']);

    // Tạo transfer mới
    Route::post('/{id}/transfers', [BookTransferController::class, 'store']);

    // Cập nhật transfer
    Route::put('/{id}/transfers/{transferId}', [BookTransferController::class, 'update']);
});
