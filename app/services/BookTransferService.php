<?php

namespace App\Services;

use App\Models\Book;
use App\Models\BookTransfer;
use App\Models\Employee;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class BookTransferService
{
    const STATUS_CANCELLED = 0;
    const STATUS_PROCESSING = 1;
    const STATUS_COMPLETED = 2;

    // Validate dữ liệu transfer (to_employee_id không được trùng from_employee_id và khác phòng ban)
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
            'from_employee_id.required' => 'Người chuyển là bắt buộc.',
            'from_employee_id.exists'   => 'Người chuyển không tồn tại.',
            'to_employee_id.required'   => 'Người nhận là bắt buộc.',
            'to_employee_id.exists'     => 'Người nhận không tồn tại.',
            'to_employee_id.different'  => 'Người nhận không được trùng với người chuyển.',
        ]);

        // Validate thêm: không cùng phòng ban (tồn tại đã được rule exists kiểm tra)
        $validator->after(function ($v) use ($data) {
            if (!empty($data['from_employee_id']) && !empty($data['to_employee_id'])) {
                $fromEmployee = Employee::find($data['from_employee_id']);
                $toEmployee = Employee::find($data['to_employee_id']);

                if ((int) $fromEmployee->department_id === (int) $toEmployee->department_id) {
                    $v->errors()->add('to_employee_id', 'Người nhận phải thuộc phòng ban khác với người chuyển.');
                }
            }
        });

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
     * Tạo transfer khởi tạo ngay sau khi tạo book.
     * - from_employee_id và to_employee_id để tạm thời null (sẽ cập nhật sau).
     * - Cập nhật luôn trạng thái book về PROCESSING (1).
     */
    public function createInitialTransfer(int $bookId)
    {
        return DB::transaction(function () use ($bookId) {
            $book = Book::findOrFail($bookId);

            // Cập nhật trạng thái sách thành Đang thực hiện
            if ((int) $book->status === BookService::STATUS_PENDING) {
                $book->update(['status' => BookService::STATUS_PROCESSING]);
            }

            $transfer = BookTransfer::create([
                'book_id' => $bookId,
                'from_employee_id' => null, // Để trống
                'to_employee_id' => null, // Để trống
                'start_time' => now(),
                'status' => self::STATUS_PROCESSING,
            ]);

            return $transfer->fresh(['book', 'fromEmployee', 'toEmployee']);
        });
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

            // Không cho phép chuyển nếu sách đã hủy hoặc đã hoàn thành
            if (in_array((int) $book->status, [BookService::STATUS_CANCELLED, BookService::STATUS_COMPLETED], true)) {
                throw ValidationException::withMessages([
                    'status' => ['Sách đã kết thúc và không thể chuyển.'],
                ]);
            }

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

        // Lấy sách và kiểm tra trạng thái
        $book = Book::findOrFail($bookId);
        if (in_array((int) $book->status, [BookService::STATUS_CANCELLED, BookService::STATUS_COMPLETED], true)) {
            throw ValidationException::withMessages([
                'status' => ['Sách đã kết thúc và không thể chuyển.'],
            ]);
        }

        $validator = Validator::make($data, [
            'to_employee_id' => 'required|exists:employees,id',
        ], [
            'to_employee_id.required' => 'Người nhận là bắt buộc.',
            'to_employee_id.exists'   => 'Người nhận không tồn tại.',
        ]);
        $validator->after(function ($v) use ($transfer) {
            $toEmployeeId = (int) $v->getValue('to_employee_id');

            // Không cùng 1 người
            if ((int) $transfer->from_employee_id === $toEmployeeId) {
                $v->errors()->add('to_employee_id', 'Người nhận không được trùng với người chuyển.');
            }

            // Không cùng 1 phòng ban (tồn tại đã được rule exists kiểm tra)
            $fromEmployee = $transfer->fromEmployee ?? Employee::find($transfer->from_employee_id);
            $toEmployee = Employee::find($toEmployeeId);

            if ((int) $fromEmployee->department_id === (int) $toEmployee->department_id) {
                $v->errors()->add('to_employee_id', 'Người nhận phải thuộc phòng ban khác với người chuyển.');
            }
        });

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $transfer->update(['to_employee_id' => $data['to_employee_id']]);

        return $transfer->fresh(['book', 'fromEmployee', 'toEmployee']);
    }
}
