<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function apiLogin(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            return response()->json([
                'success' => false,
                'message' => 'Tên đăng nhập hoặc mật khẩu không đúng.'
            ], 401);
        }

        $request->session()->regenerate();

        $user = Auth::user();

        if ($user->status == 0) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'success' => false,
                'message' => 'Tài khoản đã bị khóa.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'status' => $user->status,
                'position' => $user->positionName,
                'employee' => $user->employee ? [
                    'id' => $user->employee->id,
                    'name' => $user->employee->name,
                    'email' => $user->employee->email,
                    'phone' => $user->employee->phone,
                    'birthday' => $user->employee->birthday,
                    'sex' => $user->employee->sex ? 'Nam' : 'Nữ',
                    'status' => $user->employee->status ? 'Đang làm việc' : 'Nghỉ làm',
                    'department' => $user->employee->department->name ?? null,
                    'position' => $user->employee->position->name ?? null,
                ] : null
            ],
        ]);
    }

    public function apiLogout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Đăng xuất thành công'
        ]);
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
                    'position' => $user->positionName,
                    'employee' => $user->employee ? [
                        'id'         => $user->employee->id,
                        'name'       => $user->employee->name,
                        'email'      => $user->employee->email,
                        'phone'      => $user->employee->phone,
                        'birthday'   => $user->employee->birthday,
                        'sex'        => $user->employee->sex ? 'Nam' : 'Nữ',
                        'status'     => $user->employee->status ? 'Đang làm việc' : 'Nghỉ làm',
                        'department' => $user->employee->department->name ?? null,
                        'position'   => $user->employee->position->name ?? null,
                    ] : null
                ]
            ]);
        }

        return response()->json([
            'authenticated' => false
        ], 401);
    }
}
