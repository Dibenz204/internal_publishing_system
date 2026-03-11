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



    //SỬ DỤNG TOKEN
    // public function apiLogin(Request $request)
    // {
    //     $credentials = $request->validate([
    //         'username' => 'required|string',
    //         'password' => 'required|string',
    //     ]);

    //     if (!Auth::attempt($credentials, $request->boolean('remember'))) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Tên đăng nhập hoặc mật khẩu không đúng.'
    //         ], 401);
    //     }

    //     $request->session()->regenerate(); // chống session fixation

    //     $user = Auth::user();

    //     if ($user->status == 0) {
    //         Auth::logout();
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Tài khoản đã bị khóa.'
    //         ], 403);
    //     }

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Đăng nhập thành công',
    //         'user' => [
    //             'id' => $user->id,
    //             'username' => $user->username,
    //             'status' => $user->status,
    //             'position' => $user->positionName,
    //             'employee' => [
    //                 'id' => $user->employee->id,
    //                 'name' => $user->employee->name,
    //                 'email' => $user->employee->email,
    //                 'phone' => $user->employee->phone,
    //                 'birthday' => $user->employee->birthday,
    //                 'sex' => $user->employee->sex ? 'Nam' : 'Nữ',
    //                 'status' => $user->employee->status ? 'Đang làm việc' : 'Nghỉ làm',
    //                 'department' => $user->employee->department->name,
    //                 'position' => $user->employee->position->name,
    //             ]
    //         ]
    //     ]);
    // }
    // public function apiLogin(Request $request)
    // {
    //     $credentials = $request->validate([
    //         'username' => 'required|string',
    //         'password' => 'required|string',
    //     ]);

    //     if (Auth::attempt($credentials, $request->boolean('remember'))) {
    //         $user = Auth::user();

    //         if ($user->status == 0) {
    //             Auth::logout();
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Tài khoản đã bị khóa.'
    //             ], 401);
    //         }


    //         // Xóa token cũ trong database (dạng thay thế token cũ)
    //         // Nhưng hiện tại dựa vào token, sẽ truy xuất được lượt đăng nhập, nên về sau sẽ tính tới trường hợp xóa token cũ
    //         // $user->tokens()->delete();


    //         // Khi tạo token mới
    //         $token = $user->createToken('auth-token')->plainTextToken;

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Đăng nhập thành công',
    //             'user' => [
    //                 'id' => $user->id,
    //                 'username' => $user->username,
    //                 'status' => $user->status,
    //                 'position' => $user->positionName,
    //                 // 'employee' => $user->employee, //Cách này thì trả ra toàn bộ thông tin emp cx như toàn bộ tt khóa ngoại
    //                 'employee' => [
    //                     'id' => $user->employee->id,
    //                     'name' => $user->employee->name,
    //                     'email' => $user->employee->email,
    //                     'phone' => $user->employee->phone,
    //                     'birthday' => $user->employee->birthday,
    //                     'sex' => $user->employee->sex ? 'Nam' : 'Nữ',
    //                     'status' => $user->employee->status ? 'Đang làm việc' : 'Nghỉ làm',
    //                     'department_id' => $user->employee->department->name,
    //                     'position_id' => $user->employee->position->name,
    //                 ]
    //             ],
    //             'token' => $token, // Nếu dùng Sanctum
    //             // 'redirect' => $this->getDashboardRoute($user)
    //         ]);
    //     }

    //     return response()->json([
    //         'success' => false,
    //         'message' => 'Tên đăng nhập hoặc mật khẩu không đúng.'
    //     ], 401);
    // }

    // public function apiLogout(Request $request)
    // {
    //     try {
    //         $request->user()->currentAccessToken()->delete();

    //         Auth::logout();

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Đăng xuất thành công'
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Có lỗi xảy ra khi đăng xuất'
    //         ], 500);
    //     }
    // }

    // // Để sẵn mốt tùy chỉnh sau
    // private function getDashboardRoute($user)
    // {
    //     $positionName = $user->positionName;

    //     switch ($positionName) {
    //         case 'Admin':
    //             return '/admin/dashboard';
    //         case 'Quản lý':
    //             return '/manager/dashboard';
    //         case 'Thủ thư':
    //             return '/librarian/dashboard';
    //         case 'Nhân viên':
    //             return '/employee/dashboard';
    //         default:
    //             return '/dashboard';
    //     }
    // }

    // public function checkAuth(Request $request)
    // {
    //     if (Auth::check()) {
    //         $user = Auth::user();
    //         return response()->json([
    //             'authenticated' => true,
    //             'user' => [
    //                 'id' => $user->id,
    //                 'username' => $user->username,
    //                 'email' => $user->email,
    //                 'position' => $user->positionName,
    //                 'employee' => $user->employee,
    //             ]
    //         ]);
    //     }

    //     return response()->json([
    //         'authenticated' => false
    //     ], 401);
    // }
}
