<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ReportController;

Route::prefix('reports')->group(function () {

    // Trưởng phòng xem phòng của mình
    Route::get('/my-department', [ReportController::class, 'myDepartmentReport']);

    // Admin xem toàn bộ hoặc lọc
    Route::get('/overview', [ReportController::class, 'overviewReport']);



    // Báo cáo dự án hoàn thành
    Route::get('/completed-projects', [ReportController::class, 'completedProjects']);  //oke (lấy toàn bộ)

    // Báo cáo theo phòng ban
    Route::get('department/{departmentId}', [ReportController::class, 'departmentReport']);  //đã oke, cần thêm bộ lọc thời gian

    // Chi tiết một dự án
    Route::get('/project/{projectId}', [ReportController::class, 'projectDetail']);   //chưa biết

    // Tổng hợp theo tháng
    Route::get('/monthly-summary', [ReportController::class, 'monthlySummary']);  // chưa sử dụng

    Route::get('department/{departmentId}/export', [ReportController::class, 'exportDepartmentReport']);
});
