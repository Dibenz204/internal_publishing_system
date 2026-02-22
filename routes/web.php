<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;

// Route đăng nhập - KHÔNG cần auth
Route::get('/login', function () {
    return view('app');
})->name('login');

Route::middleware('auth')->group(function () {

    Route::get('/{any}', function () {
        return view('app');
    })->where('any', '^(?!api).*$');
});
