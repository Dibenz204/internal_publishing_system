<?php

use App\Http\Controllers\Api\AllocationController;
use Illuminate\Support\Facades\Route;

Route::prefix('allocations')->group(function () {

    // Phân công nhân viên vào project
    Route::post('/assign', [AllocationController::class, 'assignEmployee']);

    // Lấy danh sách phân công theo book
    Route::get('/allocation-detail', [AllocationController::class, 'allocationDetail']);

    // Xóa nhân viên khỏi allocation
    // Chỉ xóa được nếu nhân viên chưa làm trang nào
    Route::delete('/remove/{allocationId}', [AllocationController::class, 'removeEmployee']);

    // Gửi project lên trưởng phòng (level 2)
    // Chỉ gửi được khi tất cả nhân viên level 1 đã hoàn thành
    Route::patch('/submit/{projectId}', [AllocationController::class, 'submit']);

    // Đánh dấu allocation hoàn thành
    // Nhân viên sau khi làm xong công việc sẽ complete
    Route::patch('/complete/{allocationId}', [AllocationController::class, 'complete']);

    // Mở lại project đã hoàn thành
    // Dùng khi cần chỉnh sửa hoặc làm lại project
    Route::patch('/reopen-project/{projectId}', [AllocationController::class, 'reopenProject']);

    // Mở lại allocation đã hoàn thành
    // Cho phép nhân viên tiếp tục làm lại
    Route::patch('/reopen-allocation/{allocationId}', [AllocationController::class, 'reopenAllocation']);

    // Lấy danh sách công việc của nhân viên đang đăng nhập
    Route::get('/my-allocations', [AllocationController::class, 'myAllocations']);

    // Cập nhật số trang đã hoàn thành
    Route::patch('/update-completed-page/{allocationId}', [AllocationController::class, 'updateCompletedPage']);

});