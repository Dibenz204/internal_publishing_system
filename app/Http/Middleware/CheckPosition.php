<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPosition
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  mixed  ...$positions
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$positions)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng đăng nhập để tiếp tục'
            ], 401);
        }

        $positionName = $user->positionName;

        if (!$positionName) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản của bạn chưa được phân quyền'
            ], 403);
        }

        if (in_array($positionName, $positions)) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Bạn không có quyền để truy cập vào',
            'required_positions' => $positions,
            'your_position' => $positionName
        ], 403);
    }
}
