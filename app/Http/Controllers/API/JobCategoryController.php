<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\JobCategoryService;

class JobCategoryController extends Controller
{
    protected $jobCategoryService;

    public function __construct(JobCategoryService $jobCategoryService)
    {
        $this->jobCategoryService = $jobCategoryService;
    }

    // Lấy tất cả
    public function getAll()
    {
        $data = $this->jobCategoryService->getAll();

        return response()->json([
            'success' => true,
            'message' => 'Job categories retrieved successfully',
            'data' => $data
        ]);
    }

    // Lấy những cái đang hoạt động
    public function getActive()
    {
        $data = $this->jobCategoryService->getActive();

        return response()->json([
            'success' => true,
            'message' => 'Active job categories retrieved successfully',
            'data' => $data
        ]);
    }

    // Tạo mới
    public function create(Request $request)
    {
        $data = $this->jobCategoryService->create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Job category created successfully',
            'data' => $data
        ]);
    }

    public function update(Request $request, $id)
    {
        $data = $this->jobCategoryService->update($id, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'work coefficient updated successfully',
            'data' => $data
        ]);
    }

    // Tắt trạng thái
    public function disable($id)
    {
        $data = $this->jobCategoryService->disable($id);

        return response()->json([
            'success' => true,
            'message' => 'Job category disabled successfully',
            'data' => $data
        ]);
    }
}
