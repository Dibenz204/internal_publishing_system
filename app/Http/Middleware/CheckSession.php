<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken; // Thêm dòng này

class CheckSession
{
    public function handle($request, Closure $next)
    {
        $token = $request->bearerToken();

        if ($token) {
            $currentToken = PersonalAccessToken::findToken($token);

            if ($currentToken) {
                $user = $currentToken->tokenable;

                if ($user->session_id && $user->session_id != $currentToken->id) {
                    $currentToken->delete();

                    return response()->json([
                        'success' => false,
                        'message' => 'Tài khoản đã được đăng nhập ở nơi khác!'
                    ], 401);
                }
            }
        }

        return $next($request);
    }
}
