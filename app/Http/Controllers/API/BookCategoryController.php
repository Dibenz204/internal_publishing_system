<?php

namespace App\Http\Controllers\Api;

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

    /**
     * GET /api/book-categories
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => $this->bookCategoryService->getAll()
        ]);
    }

    /**
     * GET /api/book-categories/active
     */
    public function active()
    {
        return response()->json([
            'success' => true,
            'data' => $this->bookCategoryService->getActive()
        ]);
    }

    /**
     * GET /api/book-categories/{id}
     */
    public function show($id)
    {
        return response()->json([
            'success' => true,
            'data' => $this->bookCategoryService->getById($id)
        ]);
    }

    /**
     * POST /api/book-categories
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|boolean',
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->bookCategoryService->create($data)
        ], 201);
    }

    /**
     * PUT /api/book-categories/{id}
     */
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

    /**
     * PATCH /api/book-categories/{id}/deactivate
     */
    public function deactivate($id)
    {
        return response()->json([
            'success' => true,
            'data' => $this->bookCategoryService->deactivate($id)
        ]);
    }

    /**
     * PATCH /api/book-categories/{id}/activate
     */
    public function activate($id)
    {
        return response()->json([
            'success' => true,
            'data' => $this->bookCategoryService->activate($id)
        ]);
    }
}