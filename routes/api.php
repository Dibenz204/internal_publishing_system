 <?php

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Route;

    //Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    //    return $request->user();
    // });


    Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
        return $request->user();
    });


    // User routes
    Route::prefix('user')->group(function () {
        require __DIR__ . '/api/user.php'; // Sẽ handle: /api/user/...
    });

    //require __DIR__ . '/api/book-category.php';    // URL: /api/book-category/.....
