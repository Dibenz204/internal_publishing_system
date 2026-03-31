<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\BookCategoryService;
use Illuminate\Http\Request;

class BookCategoryController extends Controller
{
    protected BookCategoryService $bookCategoryService;

    public function __construct(BookCategoryService $bookCategoryService)
    {
        $this->bookCategoryService = $bookCategoryService;
    }

    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => $this->bookCategoryService->getAll()
        ]);
    }

    public function active()
    {
        return response()->json([
            'success' => true,
            'data' => $this->bookCategoryService->getActive()
        ]);
    }

    public function show($id)
    {
        return response()->json([
            'success' => true,
            'data' => $this->bookCategoryService->getById($id)
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $data['status'] = 1;

        return response()->json([
            'success' => true,
            'data' => $this->bookCategoryService->create($data)
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'boolean',
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->bookCategoryService->update($id, $data)
        ]);
    }

    public function deactivate($id)
    {
        return response()->json([
            'success' => true,
            'data' => $this->bookCategoryService->deactivate($id)
        ]);
    }

    public function activate($id)
    {
        return response()->json([
            'success' => true,
            'data' => $this->bookCategoryService->activate($id)
        ]);
    }
}
