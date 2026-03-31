<?php

namespace App\Http\Controllers\API;

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


    public function index(int $id): JsonResponse
    {
        $transfers = $this->bookTransferService->getTransfersByBookId($id);

        return response()->json([
            'success' => true,
            'message' => 'Transfers retrieved successfully',
            'data'    => $transfers
        ]);
    }


    public function store(Request $request, int $id): JsonResponse
    {
        $transfer = $this->bookTransferService->createTransfer($id, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Transfer created successfully',
            'data'    => $transfer
        ]);
    }

    public function sendToAssignedBy(Request $request, int $bookId)
    {
        $transfer = $this->bookTransferService->sendToAssignedBy(
            $bookId,
            $request->input('note')
        );
        return response()->json(['success' => true, 'data' => $transfer]);
    }
}
