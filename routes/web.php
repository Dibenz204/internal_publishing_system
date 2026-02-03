
<?php

use Illuminate\Support\Facades\Route;

// Route cho React app
Route::get('/', function () {
    return view('app');
});

// Route cho các page React (SPA)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

// Giữ route welcome nếu muốn
Route::get('/welcome', function () {
    return view('welcome');
});
