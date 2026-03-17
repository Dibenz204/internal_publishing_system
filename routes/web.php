<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ReportController;

Route::get('/reports/export-template', [ReportController::class, 'exportTemplate']);
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
