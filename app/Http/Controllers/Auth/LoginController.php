<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class LoginController extends Controller
{
    public function apiLogin(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $user = Auth::user();

            if ($user->status == 0) {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'Tài khoản đã bị khóa.'
                ], 401);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Đăng nhập thành công',
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'status' => $user->status,
                    'position' => $user->positionName,
                    'employee' => $user->employee,
                ],
                'token' => $token, // Nếu dùng Sanctum
                'redirect' => $this->getDashboardRoute($user)
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Tên đăng nhập hoặc mật khẩu không đúng.'
        ], 401);
    }

    public function apiLogout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        Auth::logout();

        return response()->json([
            'success' => true,
            'message' => 'Đăng xuất thành công'
        ]);
    }

    // Để sẵn mốt tùy chỉnh sau
    private function getDashboardRoute($user)
    {
        $positionName = $user->positionName;

        switch ($positionName) {
            case 'Admin':
                return '/admin/dashboard';
            case 'Quản lý':
                return '/manager/dashboard';
            case 'Thủ thư':
                return '/librarian/dashboard';
            case 'Nhân viên':
                return '/employee/dashboard';
            default:
                return '/dashboard';
        }
    }

    public function checkAuth(Request $request)
    {
        if (Auth::check()) {
            $user = Auth::user();
            return response()->json([
                'authenticated' => true,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'position' => $user->positionName,
                    'employee' => $user->employee,
                ]
            ]);
        }

        return response()->json([
            'authenticated' => false
        ], 401);
    }
}
