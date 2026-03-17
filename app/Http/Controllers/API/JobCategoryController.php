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


    public function getAll()
    {
        $data = $this->jobCategoryService->getAll();

        return response()->json([
            'success' => true,
            'message' => 'Job categories retrieved successfully',
            'data' => $data
        ]);
    }

    public function getActive()
    {
        $data = $this->jobCategoryService->getActive();

        return response()->json([
            'success' => true,
            'message' => 'Active job categories retrieved successfully',
            'data' => $data
        ]);
    }

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


    public function disable($id)
    {
        $data = $this->jobCategoryService->disable($id);

        return response()->json([
            'success' => true,
            'message' => 'Job category disabled successfully',
            'data' => $data
        ]);
    }



    public function getByCategory($category)
    {
        try {
            $jobCategories = $this->jobCategoryService->getByCategory($category);

            return response()->json([
                'success' => true,
                'data' => $jobCategories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function getGrouped()
    {
        try {
            $data = $this->jobCategoryService->getAllGroupedByCategory();

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
