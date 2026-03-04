<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->renderable(function (Throwable $e, Request $request) {

            // Chỉ xử lý cho API
            if (!$request->is('api/*')) {
                return null;
            }

            // Validation lỗi
            if ($e instanceof ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors'  => $e->errors(),
                ], 422);
            }

            // Model không tồn tại
            if ($e instanceof ModelNotFoundException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resource not found',
                ], 404);
            }

            // Route không tồn tại
            if ($e instanceof NotFoundHttpException) {
                return response()->json([
                    'success' => false,
                    'message' => 'API route not found',
                ], 404);
            }

            // Lỗi khác
            return response()->json([
                'success' => false,
                'message' => config('app.debug') 
                    ? $e->getMessage() 
                    : 'Server Error',
            ], 500);
        });
    }
}