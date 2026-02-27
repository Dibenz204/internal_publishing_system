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
    const STATUS_PERFORM   = 1;

    // Validate dữ liệu transfer
    private function validateTransfer(array $data): array
    {
        $validator = Validator::make($data, [
            'book_id' => 'required|exists:books,id',
            'to_employee_id' => 'required|exists:employees,id',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    // Tạo transfer đầu tiên khi book được tạo
    public function createInitialTransfer(Book $book)
    {
        return BookTransfer::create([
            'book_id' => $book->id,
            'from_employee_id' => $book->assigned_by,
            'to_employee_id' => $book->assigned_by,
            'start_time' => now(),
            'status' => self::STATUS_PERFORM,
        ]);
    }

    // Chuyển book sang nhân viên khác
    public function transfer(array $data)
    {
        return DB::transaction(function () use ($data) {

            $validated = $this->validateTransfer($data);

            $book = Book::findOrFail($validated['book_id']);

            // Không cho transfer (chuyển cv, bàn giao cv) nếu book đã COMPLETED
            if (in_array($book->status, [
                BookService::STATUS_CANCELLED,
                BookService::STATUS_COMPLETED
            ])) {
                throw ValidationException::withMessages([
                    'status' => ['Cannot transfer an ended book']
                ]);
            }

            // Không cho transfer (chuyển cv, bàn giao cv) nếu người nhận giống người hiện tại
            if ($book->assigned_by == $validated['to_employee_id']) {
                throw ValidationException::withMessages([
                    'to_employee_id' => ['Book is already assigned to this employee']
                ]);
            }

            // Đóng transfer hiện tại
            BookTransfer::where('book_id', $book->id)
                ->where('status', self::STATUS_PERFORM)
                ->update([
                    'status' => self::STATUS_CANCELLED,
                    'end_time' => now(),
                ]);

            // Tạo transfer mới
            $newTransfer = BookTransfer::create([
                'book_id' => $book->id,
                'from_employee_id' => $book->assigned_by,
                'to_employee_id' => $validated['to_employee_id'],
                'start_time' => now(),
                'status' => self::STATUS_PERFORM,
            ]);

            // Cập nhật assigned_by trong books
            $book->update([
                'assigned_by' => $validated['to_employee_id'],
            ]);

            return $newTransfer->fresh([
                'book',
                'fromEmployee',
                'toEmployee'
            ]);
        });
    }
}