<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ReportController;

Route::get('/reports/export-template', [ReportController::class, 'exportTemplate']);

// Chỉ serve app.blade.php khi không phải API request
Route::get('/{any?}', function () {
    return response()->json(['message' => 'Backend API is running']);
})->where('any', '.*');

// use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\Api\ReportController;

// Route::get('/reports/export-template', [ReportController::class, 'exportTemplate']);
// Route::get('/{any?}', function () {
//     return view('app');
// })->where('any', '.*');
