<?php

use App\Http\Controllers\Api\AllocationController;
use Illuminate\Support\Facades\Route;

Route::prefix('allocations')->group(function () {

    Route::post('/assign', [AllocationController::class, 'assignEmployee'])
        ->middleware("position:Trưởng phòng"); //

    Route::delete('/{allocationId}', [AllocationController::class, 'removeEmployee']); //

    // Đánh dấu allocation hoàn thành
    Route::patch('/complete/{allocationId}', [AllocationController::class, 'complete']); //

    Route::patch('/reopen/{allocationId}', [AllocationController::class, 'reopen']);

    // Lấy danh sách công việc theo từng nhân viên
    Route::get('/my-allocations', [AllocationController::class, 'myAllocations']);    //

    // Update completed_page và current_book
    Route::patch('/{allocationId}/completed-page', [AllocationController::class, 'updateCompletedPage']); //

    Route::patch('/{allocationId}/job', [AllocationController::class, 'updateJob']);
});

//Hàm xem allocation theo project nào đó
Route::get('/projects/{projectId}/allocations', [AllocationController::class, 'getProjectAllocations']);  // lấy allocation theo project //

Route::get('/books/{bookId}/allocations', [AllocationController::class, 'getBookAllocations']); // lấy allocation theo book //

Route::get('/projects/{projectId}/available-employees', [AllocationController::class, 'getAvailableEmployees']);
