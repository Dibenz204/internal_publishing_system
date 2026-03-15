<?php
// routes/api.php

use App\Http\Controllers\Api\TruongPhongBookController;
use Illuminate\Support\Facades\Route;

Route::prefix('books')->group(function () {
    // Route cho Trưởng phòng lấy sách theo tên phòng ban
    Route::get('/department/name/{departmentName}', [TruongPhongBookController::class, 'getBooksByDepartmentName'])
        ->middleware('position:Trưởng phòng');

    Route::patch('/projects/{projectId}/cancel', [TruongPhongBookController::class, 'cancelProject'])
        ->middleware('position:Trưởng phòng');

    Route::get('/projects/{projectId}', [TruongPhongBookController::class, 'getProjectDetail'])
        ->middleware('position:Trưởng phòng');
});
