<?php

namespace App\Services;

use App\Models\Book;
use App\Models\BookTransfer;
use App\Models\Employee;
use App\Models\Allocation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class BookTransferService
{
    const STATUS_CANCELLED = 0;
    const STATUS_PERFORM = 1;


    private function loadTransferWithDepartment(BookTransfer $transfer): BookTransfer
    {
        return $transfer->load([
            'book',
            'fromEmployee:id,name,email,department_id',
            'fromEmployee.department:id,name',
            'toEmployee:id,name,email,department_id',
            'toEmployee.department:id,name',
        ]);
    }

    protected function closeCurrentTransfers(int $bookId): void
    {
        BookTransfer::where('book_id', $bookId)
            ->where('status', self::STATUS_PERFORM)
            ->update([
                'status'   => self::STATUS_CANCELLED,
                'end_time' => now(),
            ]);
    }

    private function validateTransfer(array $data): array
    {
        $rules = [
            'book_id' => 'required|exists:books,id',
            'to_employee_id' => ['required', 'exists:employees,id'],
            'note' => 'nullable|string|max:1000',
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


        $validator->after(function ($v) use ($data) {
            if (!empty($data['from_employee_id']) && !empty($data['to_employee_id'])) {
                $fromEmployee = Employee::find($data['from_employee_id']);
                $toEmployee = Employee::find($data['to_employee_id']);

                if ($fromEmployee && $toEmployee && (int) $fromEmployee->department_id === (int) $toEmployee->department_id) {
                    $v->errors()->add('to_employee_id', 'Người nhận phải thuộc phòng ban khác với người chuyển.');
                }
            }
        });

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }


    public function getTransfersByBookId(int $id)
    {
        return BookTransfer::select(['id', 'book_id', 'status', 'from_employee_id', 'to_employee_id', 'start_time', 'end_time', 'note'])
            ->with([
                'fromEmployee:id,name,email,department_id',
                'fromEmployee.department:id,name',
                'toEmployee:id,name,email,department_id',
                'toEmployee.department:id,name',
            ])
            ->where('book_id', $id)
            ->orderByDesc('id')
            ->get();
    }

    public function createInitialTransfer(Book $book)
    {
        return DB::transaction(function () use ($book) {

            $transfer = BookTransfer::create([
                'book_id' => $book->id,
                'from_employee_id' => $book->assigned_by,
                'to_employee_id' => $book->assigned_by,
                'start_time' => now(),
                'note' => 'Khởi tạo sách',
                'status' => self::STATUS_PERFORM,
            ]);

            return $transfer->fresh(['book', 'fromEmployee', 'toEmployee']);
        });
    }

    public function createTransfer(int $bookId, array $data)
    {
        $validated = $this->validateTransfer(array_merge($data, ['book_id' => $bookId]));

        return DB::transaction(function () use ($bookId, $validated) {

            $book = Book::findOrFail($bookId);

            if (in_array((int) $book->status, [BookService::STATUS_CANCELLED, BookService::STATUS_COMPLETED], true)) {
                throw ValidationException::withMessages([
                    'status' => ['Sách đã kết thúc và không thể chuyển.'],
                ]);
            }


            $toEmployee = Employee::with('position')->findOrFail($validated['to_employee_id']);

            if (!$toEmployee->position || $toEmployee->position->name !== 'Trưởng phòng') {
                throw ValidationException::withMessages([
                    'to_employee_id' => ['Người nhận phải có chức vụ Trưởng phòng.'],
                ]);
            }


            $projectDepartmentIds = \App\Models\Project::where('book_id', $bookId)
                ->pluck('department_id')
                ->toArray();

            if (!in_array((int) $toEmployee->department_id, $projectDepartmentIds)) {
                throw ValidationException::withMessages([
                    'to_employee_id' => ['Người nhận phải thuộc phòng ban đang thực hiện sách này.'],
                ]);
            }


            $currentTransfer = BookTransfer::where('book_id', $bookId)
                ->where('status', self::STATUS_PERFORM)
                ->latest('id')
                ->first();


            $fromEmployeeId = Auth::user()->employee_id;
            $fromEmployee   = Employee::findOrFail($fromEmployeeId);


            if ($currentTransfer && (int) $fromEmployeeId !== (int) $currentTransfer->to_employee_id) {
                throw ValidationException::withMessages([
                    'from_employee_id' => ['Người chuyển phải là người đang giữ sách hiện tại.'],
                ]);
            }


            BookTransfer::where('book_id', $bookId)
                ->where('status', self::STATUS_PERFORM)
                ->update([
                    'status'   => self::STATUS_CANCELLED,
                    'end_time' => now(),
                ]);

            $fromEmployeeId = Auth::user()->employee_id;
            $fromEmployee   = Employee::findOrFail($fromEmployeeId);

            $transfer = BookTransfer::create([
                'book_id'          => $bookId,
                'from_employee_id' => $fromEmployeeId,
                'to_employee_id'   => $validated['to_employee_id'],
                'start_time'       => now(),
                'note'             => $validated['note'] ?? null,
                'status'           => self::STATUS_PERFORM,
            ]);

            return $this->loadTransferWithDepartment($transfer);
        });
    }

    public function sendToAssignedBy(int $bookId, ?string $note = null): BookTransfer
    {
        return DB::transaction(function () use ($bookId, $note) {

            $book = Book::findOrFail($bookId);

            if (in_array((int) $book->status, [BookService::STATUS_CANCELLED, BookService::STATUS_COMPLETED], true)) {
                throw ValidationException::withMessages([
                    'status' => ['Sách đã kết thúc và không thể chuyển.'],
                ]);
            }


            $hasUnfinishedAllocation = Allocation::join('projects', 'allocations.project_id', '=', 'projects.id')
                ->where('projects.book_id', $bookId)
                ->where('allocations.status', '!=', 2)
                ->exists();

            if ($hasUnfinishedAllocation) {
                throw ValidationException::withMessages([
                    'allocation' => ['Vẫn còn công việc chưa hoàn thành trong dự án của sách.'],
                ]);
            }

            $fromEmployeeId = Auth::user()->employee_id;
            $fromEmployee   = Employee::findOrFail($fromEmployeeId);

            $toEmployeeId = (int) $book->assigned_by;
            $toEmployee   = Employee::findOrFail($toEmployeeId);


            if ($fromEmployeeId === $toEmployeeId) {
                throw ValidationException::withMessages([
                    'to_employee_id' => ['Không thể chuyển sách cho chính mình.'],
                ]);
            }


            if ((int) $fromEmployee->department_id === (int) $toEmployee->department_id) {
                throw ValidationException::withMessages([
                    'to_employee_id' => ['Người nhận phải thuộc phòng ban khác với người chuyển.'],
                ]);
            }


            $currentTransfer = BookTransfer::where('book_id', $bookId)
                ->where('status', self::STATUS_PERFORM)
                ->latest('id')
                ->first();


            if ($currentTransfer && (int)$fromEmployeeId !== (int)$currentTransfer->to_employee_id) {
                throw ValidationException::withMessages([
                    'from_employee_id' => ['Người chuyển phải là người đang giữ sách hiện tại.'],
                ]);
            }


            $this->closeCurrentTransfers($bookId);


            $transfer = BookTransfer::create([
                'book_id'          => $bookId,
                'from_employee_id' => $fromEmployeeId,
                'to_employee_id'   => $toEmployeeId,
                'start_time'       => now(),
                'note'             => $note ?? 'Gửi về thư ký biên tập',
                'status'           => self::STATUS_PERFORM,
            ]);

            return $this->loadTransferWithDepartment($transfer);
        });
    }

    public function cancelledStatus(): int
    {
        return self::STATUS_CANCELLED;
    }
}
