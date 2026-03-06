<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BookService;
use App\Services\BookTransferService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BookController extends Controller
{
    protected BookService $bookService;
    // Khởi tạo BookService
    public function __construct(BookService $bookService)
    {
        $this->bookService = $bookService;
    }

    // Lấy danh sách tất cả sách
    public function index(): JsonResponse
    {
        $data = $this->bookService->getAll();

        return response()->json([
            'success' => true,
            'message' => 'Books retrieved successfully',
            'data'    => $data
        ]);
    }

    // Lấy chi tiết một cuốn sách theo ID
    public function show(int $id): JsonResponse
    {
        $book = $this->bookService->findById($id);

        return response()->json([
            'success' => true,
            'message' => 'Book details retrieved successfully',
            'data'    => $book
        ]);
    }

    // Tạo mới sách
    public function store(Request $request): JsonResponse
    {
        $book = $this->bookService->create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Book created successfully',
            'data' => $book
        ], 201);
    }

    // Cập nhật thông tin sách
    public function update(Request $request, int $id): JsonResponse
    {
        $book = $this->bookService->update($id, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Book updated successfully',
            'data'    => $book
        ]);
    }

    // Cập nhật tiến độ đọc
    public function updateProgress(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'current_page' => 'required|integer|min:0'
        ]);

        $book = $this->bookService->updateProgress(
            $id,
            $request->current_page
        );

        return response()->json([
            'success' => true,
            'message' => 'Progress updated successfully',
            'data'    => $book
        ]);
    }

    // Đánh dấu hoàn thành thủ công
    public function finish(int $id): JsonResponse
    {
        $book = $this->bookService->finish($id);

        return response()->json([
            'success' => true,
            'message' => 'The book has been marked as completed',
            'data'    => $book
        ]);
    }

    // Hủy sách
    public function cancel(int $id): JsonResponse
    {
        $book = $this->bookService->cancel($id);

        return response()->json([
            'success' => true,
            'message' => 'The book has been cancelled',
            'data'    => $book
        ]);
    }

    // Tìm kiếm sách
    public function search(Request $request)
    {
        $books = $this->bookService->search($request->query());

        return response()->json([
            'success' => true,
            'message' => 'Search completed successfully',
            'data' => $books
        ]);
    }
}
