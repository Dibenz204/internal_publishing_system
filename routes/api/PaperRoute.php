<?php

use App\Http\Controllers\API\PaperController;
use Illuminate\Support\Facades\Route;

Route::prefix('papers')->group(function () {

    Route::get('/', [PaperController::class, 'index']);

    Route::post('/', [PaperController::class, 'store']);

    Route::put('/{id}', [PaperController::class, 'update']);

    Route::patch('/{id}/activate', [PaperController::class, 'activate']);

    Route::patch('/{id}/deactivate', [PaperController::class, 'deactivate']);

    Route::get('/active', [PaperController::class, 'getActive']);
});
