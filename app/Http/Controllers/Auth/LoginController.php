<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Traits\LogsActivity;
use App\Models\AuditLog;
use Laravel\Sanctum\PersonalAccessToken;

class LoginController extends Controller
{

    use LogsActivity;

    // public function apiLogin(Request $request)
    // {
    //     $credentials = $request->validate([
    //         'username' => 'required|string',
    //         'password' => 'required|string',
    //     ]);

    //     if (!Auth::attempt($credentials, $request->boolean('remember'))) {

    //         AuditLog::create([
    //             'user_id'      => null,
    //             'user_name'    => null,
    //             'user_position' => null,
    //             'action'       => 'login_failed',
    //             'module'       => 'auth',
    //             'record_id'    => null,
    //             'old_data'     => null,
    //             'new_data'     => ['username' => $request->username],
    //             'ip_address'   => $request->ip(),
    //             'user_agent'   => $request->userAgent(),
    //             'method'       => $request->method(),
    //             'url'          => $request->fullUrl(),
    //         ]);

    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Tên đăng nhập hoặc mật khẩu không đúng.'
    //         ], 401);
    //     }

    //     $request->session()->regenerate();

    //     $user = Auth::user();

    public function apiLogin(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Sai tên đăng nhập hoặc mật khẩu'
            ], 401);
        }

        $user = Auth::user();

        // Kiểm tra tài khoản bị khóa
        if ($user->status == 0) {
            AuditLog::create([
                'user_id'       => $user->id,
                'user_name'     => $user->username,
                'user_position' => $user->positionName,
                'action'        => 'login_blocked',
                'module'        => 'auth',
                'record_id'     => $user->id,
                'old_data'      => null,
                'new_data'      => ['reason' => 'Tài khoản bị khóa'],
                'ip_address'    => $request->ip(),
                'user_agent'    => $request->userAgent(),
                'method'        => $request->method(),
                'url'           => $request->fullUrl(),
            ]);

            Auth::logout();

            return response()->json([
                'success' => false,
                'message' => 'Tài khoản đã bị khóa.'
            ], 403);
        }

        // Xóa hết token cũ (đẩy người đang đăng nhập trước ra)
        $user->tokens()->delete();

        // Tạo token mới
        $tokenResult = $user->createToken('auth-token');
        $token       = $tokenResult->plainTextToken;
        $tokenId     = $tokenResult->accessToken->id;

        // Lưu token ID mới vào session_id
        $user->session_id = $tokenId;
        $user->save();

        $this->logActivity(
            action: 'login',
            module: 'auth',
            recordId: $user->id,
            newData: ['username' => $user->username]
        );

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'username' => $user->username,
                'status'   => $user->status,
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
            ],
        ]);
    }

    public function apiLogout(Request $request)
    {

        $this->logActivity(
            action: 'logout',
            module: 'auth',
            recordId: Auth::id(),
        );

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
        // if (Auth::check()) {
        //     $user = Auth::user();

        $user = $request->user();

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
        // }

        // return response()->json([
        //     'authenticated' => false
        // ], 401);
    }
}
