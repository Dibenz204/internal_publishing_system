<?php

use App\Http\Controllers\Api\BookTransferController;
use Illuminate\Support\Facades\Route;

Route::prefix('books')->group(function () {

    //Lấy danh sách book transfer theo book ID
    Route::get('/{id}/transfers', [BookTransferController::class, 'getTransfers']);

    //Tạo book transfer
    Route::post('/{id}/transfers', [BookTransferController::class, 'createTransfer']);

    //Cập nhật book transfer
    Route::put('/{id}/transfers/{transferId}', [BookTransferController::class, 'updateTransfer']);
});
