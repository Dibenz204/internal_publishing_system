<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BookTransferService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BookTransferController extends Controller
{
    protected BookTransferService $bookTransferService;

    public function __construct(BookTransferService $bookTransferService)
    {
        $this->bookTransferService = $bookTransferService;
    }

    //Lấy danh sách book transfer theo book ID
    public function index(int $id): JsonResponse
    {
        $transfers = $this->bookTransferService->getTransfersByBookId($id);

        return response()->json([
            'success' => true,
            'message' => 'Transfers retrieved successfully',
            'data'    => $transfers
        ]);
    }

    //Tạo book transfer
    public function store(Request $request, int $id): JsonResponse
    {
        $transfer = $this->bookTransferService->createTransfer($id, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Transfer created successfully',
            'data'    => $transfer
        ]);
    }

    //Cập nhật book transfer
    public function update(Request $request, int $id, int $transferId): JsonResponse
    {
        $transfer = $this->bookTransferService->updateTransfer($id, $transferId, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Transfer updated successfully',
            'data'    => $transfer
        ]);
    }
}
