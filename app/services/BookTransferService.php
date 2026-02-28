<?php

namespace App\Services;

use App\Models\Book;
use App\Models\BookTransfer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class BookTransferService
{
    const STATUS_CANCELLED = 0;
    const STATUS_PROCESSING = 1;
    const STATUS_COMPLETED = 2;

    // Validate dữ liệu transfer (to_employee_id không được trùng from_employee_id)
    private function validateTransfer(array $data): array
    {
        $rules = [
            'book_id' => 'required|exists:books,id',
            'from_employee_id' => 'required|exists:employees,id', // TODO: sau này lấy từ user id theo token
            'to_employee_id' => ['required', 'exists:employees,id'],
        ];
        if (!empty($data['from_employee_id'])) {
            $rules['to_employee_id'][] = 'different:from_employee_id';
        }

        $validator = Validator::make($data, $rules, [
            'to_employee_id.different' => 'Người nhận không được trùng với người chuyển.',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    // Lấy danh sách book transfer theo book ID
    public function getTransfersByBookId(int $id)
    {
        return BookTransfer::select(['id', 'book_id', 'status', 'from_employee_id', 'to_employee_id', 'start_time', 'end_time'])
            ->with(['fromEmployee:id,name,email', 'toEmployee:id,name,email'])
            ->where('book_id', $id)
            ->orderByDesc('id')
            ->get();
    }

    /**
     * Tạo book transfer.
     * - Nếu chưa có transfer nào của book → cập nhật status book thành 1 (PROCESSING).
     * - Cập nhật transfer trước (đang PROCESSING) thành status 2 (COMPLETED).
     * - Transfer mới có status mặc định 1 (PROCESSING).
     */
    public function createTransfer(int $bookId, array $data)
    {
        $validated = $this->validateTransfer(array_merge($data, ['book_id' => $bookId]));

        return DB::transaction(function () use ($bookId, $validated) {
            $book = Book::findOrFail($bookId);

            // Chưa có transfer nào → cập nhật status book thành 1 (PROCESSING)
            $hasAnyTransfer = BookTransfer::where('book_id', $bookId)->exists();
            if (!$hasAnyTransfer) {
                $book->update(['status' => BookService::STATUS_PROCESSING]);
            }

            // Cập nhật transfer trước (đang PROCESSING) thành COMPLETED (2) và end_time
            BookTransfer::where('book_id', $bookId)
                ->where('status', self::STATUS_PROCESSING)
                ->update([
                    'status' => self::STATUS_COMPLETED,
                    'end_time' => now(),
                ]);

            // from_employee_id hiện lấy từ request; TODO: sau này lấy từ user id theo token
            $transfer = BookTransfer::create([
                'book_id' => $bookId,
                'from_employee_id' => $validated['from_employee_id'],
                'to_employee_id' => $validated['to_employee_id'],
                'start_time' => now(),
                'status' => self::STATUS_PROCESSING,
            ]);

            return $transfer->fresh(['book', 'fromEmployee', 'toEmployee']);
        });
    }

    /**
     * Cập nhật book transfer – chỉ cho phép cập nhật to_employee_id.
     */
    public function updateTransfer(int $bookId, int $transferId, array $data)
    {
        $transfer = BookTransfer::where('book_id', $bookId)->where('id', $transferId)->firstOrFail();

        $validator = Validator::make($data, [
            'to_employee_id' => 'required|exists:employees,id',
        ]);
        $validator->after(function ($v) use ($transfer) {
            if ((int) $transfer->from_employee_id === (int) $v->getValue('to_employee_id')) {
                $v->errors()->add('to_employee_id', 'Người nhận không được trùng với người chuyển.');
            }
        });

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $transfer->update(['to_employee_id' => $data['to_employee_id']]);

        return $transfer->fresh(['book', 'fromEmployee', 'toEmployee']);
    }
}
