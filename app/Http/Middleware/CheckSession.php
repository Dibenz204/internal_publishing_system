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
        $user = $request->user();

        if ($user) {
            $token = $request->bearerToken();
            $currentToken = PersonalAccessToken::findToken($token);
            $currentTokenId = $currentToken?->id;

            if ($user->session_id && (string)$user->session_id !== (string)$currentTokenId) {
                if ($currentToken) {
                    $currentToken->delete();
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Tài khoản đã được đăng nhập ở nơi khác. Vui lòng đăng nhập lại.'
                ], 401);
            }
        }

        return $next($request);
    }
}
