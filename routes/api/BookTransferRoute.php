<?php

use App\Http\Controllers\Api\BookTransferController;
use Illuminate\Support\Facades\Route;

Route::post('/books/{bookId}/send-to-assigned', [BookTransferController::class, 'sendToAssignedBy'])
    ->middleware('position:Trưởng phòng');

Route::prefix('books')->group(function () {

    Route::middleware('position:Admin,Trưởng phòng,Thư kí biên tập')->group(function () {

        // Lấy danh sách transfer của book
        Route::get('/{id}/transfers', [BookTransferController::class, 'index']);

        // Tạo transfer mới
        Route::post('/{id}/transfers', [BookTransferController::class, 'store']);
    });
});
