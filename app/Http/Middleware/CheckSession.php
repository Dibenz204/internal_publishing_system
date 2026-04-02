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
        if (Auth::check()) {
            $user = Auth::user();

            // Lấy token hiện tại từ request
            $token = $request->bearerToken();
            $currentToken = PersonalAccessToken::findToken($token);
            $currentTokenId = $currentToken?->id;

            // Kiểm tra session_id trong DB
            if ($user->session_id && $user->session_id !== $currentTokenId) {
                // Xóa token hiện tại
                if ($currentToken) {
                    $currentToken->delete();
                }
                Auth::logout();

                return response()->json([
                    'message' => 'Tài khoản đã được đăng nhập ở nơi khác.'
                ], 401);
            }
        }

        return $next($request);
    }
}
