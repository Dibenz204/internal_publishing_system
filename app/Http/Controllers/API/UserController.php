<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index()
    {
        return response()->json(
            $this->userService->getAll()
        );
    }

    public function search(Request $request)
    {
        $name = $request->query('name', '');

        return response()->json(
            $this->userService->getByEmployeeName($name)
        );
    }

    public function update(Request $request, int $id)
    {
        try {
            $user = User::findOrFail($id);
            $user = $this->userService->update($user, $request->all());

            return response()->json($user);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    public function changePassword(Request $request, int $id)
    {
        try {
            $user = User::findOrFail($id);

            $this->userService->changePassword(
                $user,
                $request->input('current_password'),
                $request->input('new_password')
            );

            return response()->json(['message' => 'Đổi mật khẩu thành công']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    public function forgotPassword(Request $request)
    {
        try {
            $user = $this->userService->findUserByContact(
                $request->input('contact')
            );

            return response()->json([
                'message' => 'Tìm thấy tài khoản',
                'user_id' => $user->id
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    public function resetPassword(Request $request)
    {
        try {
            $this->userService->resetPassword(
                $request->input('user_id'),
                $request->input('new_password')
            );

            return response()->json(['message' => 'Đặt lại mật khẩu thành công']);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }
}
