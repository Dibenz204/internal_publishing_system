<?php

namespace App\Services;

use App\Models\Book;
use App\Models\Bookcategory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use App\Services\BookTransferService;
use App\Models\Paper;
use App\Traits\LogsActivity;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BookService
{
    use LogsActivity;
    protected $bookTransferService;

    public function __construct(BookTransferService $bookTransferService)
    {
        $this->bookTransferService = $bookTransferService;
    }

    // Trạng thái sách:
    // 0 - Đã hủy
    // 1 - Đang thực hiện
    // 2 - Chờ xử lý
    // 3 - Hoàn thành
    const STATUS_CANCELLED  = 0;
    const STATUS_PROCESSING = 1;
    const STATUS_PENDING    = 2;
    const STATUS_COMPLETED  = 3;



    private function validateBook(array $data, ?int $id = null): array
    {
        $rules = [


            'name' => $id
                ? 'sometimes|required|string|max:255'
                : 'required|string|max:255',

            'bookCode' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('books', 'bookCode')->ignore($id)
            ],
            'page' => 'nullable|integer|min:1',


            'current_page' => 'nullable|integer|min:0',

            'bookSize' => 'nullable|string|max:50',

            'note' => 'nullable|string|max:1000',

            'status' => 'nullable|integer',

            'assigned_by' => 'nullable|exists:employees,id',


            'end_time' => 'nullable|date|after_or_equal:today',


            'categories' => 'sometimes|array',


            'categories.*' => [
                'integer',
                Rule::exists('bookcategories', 'id')
                    ->where('status', 1),
            ],

            'paper_id' => [
                $id ? 'sometimes' : 'required',
                'integer',
                Rule::exists('papers', 'id')->where('status', 1),
            ],
        ];

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }



    public function getAll()
    {
        $books = Book::with([
            'assignedEmployee:id,name,email,phone,birthday,sex,status,department_id,position_id,created_at,updated_at',
            'categories:id,name,description,status,created_at,updated_at',
            'paper:id,paperSize'
        ])
            ->orderByDesc('id')
            ->get();


        $books->each(function ($book) {
            $book->categories->each->makeHidden(['pivot']);
        });

        return $books;
    }


    public function findById(int $id)
    {
        $book = Book::with([
            'assignedEmployee',
            'categories',
            'paper',
            'departments',
            'departments.employees'
        ])->findOrFail($id);


        $book->categories->each->makeHidden(['pivot']);


        $totalDays = null;

        if ($book->start_time && $book->end_time) {
            $totalDays = Carbon::parse($book->start_time)
                ->diffInDays(Carbon::parse($book->end_time));
        }

        return [
            'book' => $book,
            'total_days' => $totalDays
        ];
    }


    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {

            $data = $this->validateBook($data);

            $data['status'] = self::STATUS_PENDING;
            $data['start_time'] = now();
            $data['assigned_by'] = Auth::user()->employee_id;

            $categories = $data['categories'] ?? [];
            unset($data['categories']);

            $data['page'] = $data['page'] ?? 1;

            if (!empty($data['paper_id'])) {

                $isActivePaper = Paper::where('id', $data['paper_id'])
                    ->where('status', 1)
                    ->exists();

                if (!$isActivePaper) {
                    throw new \Exception('Paper is inactive or does not exist.');
                }
            }

            $book = Book::create($data);

            if (!empty($categories)) {

                $validCategories = Bookcategory::whereIn('id', $categories)
                    ->where('status', 1)
                    ->pluck('id')
                    ->toArray();

                if (count($validCategories) !== count($categories)) {
                    throw new \Exception('One or more categories are inactive or do not exist.');
                }

                $book->categories()->sync($validCategories);
            }


            $this->bookTransferService->createInitialTransfer($book);

            $this->logCreate('book', $book->id, [
                'name'      => $book->name,
                'bookCode'  => $book->bookCode,
                'paper_id'  => $book->paper_id,
                'assigned_by' => Auth::user()->employee_id,
            ]);

            return $book->fresh(['assignedEmployee', 'categories', 'paper']);
        });
    }


    public function update(int $id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {

            $book = Book::findOrFail($id);

            $this->ensureNotEnded($book);

            $validated = $this->validateBook($data, $id);
            unset($validated['status']);
            unset($validated['assigned_by']);
            $categories = $validated['categories'] ?? null;
            unset($validated['categories']);


            if (array_key_exists('paper_id', $validated)) {

                $isActivePaper = Paper::where('id', $validated['paper_id'])
                    ->where('status', 1)
                    ->exists();

                if (!$isActivePaper) {
                    throw new \Exception('Khổ giấy này đang ko sử dụng hoặc có thể ko tồn tại');
                }
            }
            $oldData = $book->toArray();

            $book->update($validated);

            $this->logUpdate('book', $id, $oldData, $validated);

            if (!is_null($categories)) {

                $validCategories = BookCategory::whereIn('id', $categories)
                    ->where('status', 1)
                    ->pluck('id')
                    ->toArray();

                if (count($validCategories) !== count($categories)) {
                    throw new \Exception('One or more categories are invalid or inactive');
                }

                $book->categories()->sync($validCategories);
            }

            return $book->fresh([
                'assignedEmployee',
                'categories',
                'paper'
            ]);
        });
    }

    public function finish(int $id)
    {
        return DB::transaction(function () use ($id) {

            $book = Book::findOrFail($id);

            if ($book->status == self::STATUS_CANCELLED) {
                throw ValidationException::withMessages([
                    'status' => ['Cannot complete a cancelled book']
                ]);
            }

            if ($book->status == self::STATUS_COMPLETED) {
                throw ValidationException::withMessages([
                    'status' => ['The book has already been completed']
                ]);
            }

            $book->transfers()->update([
                'status' => $this->bookTransferService->cancelledStatus(),
                'end_time' => now()
            ]);

            $book->status = self::STATUS_COMPLETED;
            $book->end_time = now();
            $book->save();

            $this->logUpdate(
                'book',
                $id,
                ['status' => 'đang thực hiện'],
                [
                    'status' => 'hoàn thành',
                    'end_time' => now()
                ]
            );

            $book->projects()->update([
                'status' => ProjectService::STATUS_COMPLETED
            ]);


            $book->load(['assignedEmployee', 'categories', 'projects']);


            $book->categories->each(function ($category) {
                $category->makeHidden('pivot');
            });

            return $book;
        });
    }


    public function cancel(int $id)
    {
        return DB::transaction(function () use ($id) {

            $book = Book::findOrFail($id);

            $status = (int) $book->status;

            if ($status === self::STATUS_COMPLETED) {
                throw ValidationException::withMessages([
                    'status' => ['Cannot cancel a completed book']
                ]);
            }

            if ($status === self::STATUS_CANCELLED) {
                throw ValidationException::withMessages([
                    'status' => ['The book has already been cancelled']
                ]);
            }

            $book->status = self::STATUS_CANCELLED;
            $book->end_time = now();
            $book->save();

            $this->logUpdate(
                'book',
                $id,
                ['status' => 'đang thực hiện'],
                ['status' => 'đã hủy', 'end_time' => now()]
            );

            $book->load(['assignedEmployee', 'categories']);

            $book->categories->each(function ($category) {
                $category->makeHidden('pivot');
            });

            return $book;
        });
    }



    public function search(array $filters)
    {
        $query = Book::with([
            'assignedEmployee',
            'categories',
            'paper'
        ]);


        if (!empty($filters['paperSize'])) {
            $paperSize = trim($filters['paperSize']);

            $query->whereHas('paper', function ($q) use ($paperSize) {
                $q->where('paperSize', $paperSize);
            });
        }

        if (!empty($filters['name'])) {
            $keyword = trim($filters['name']);

            $query->where(function ($q) use ($keyword) {
                $q->where('books.name', 'like', "%$keyword%")
                    ->orWhere('books.bookCode', 'like', "%$keyword%");
            });
        }

        if (!empty($filters['category_id'])) {

            $categoryIds = (array) $filters['category_id'];

            $query->whereHas('categories', function ($q) use ($categoryIds) {
                $q->whereIn('bookcategories.id', $categoryIds);
            });
        }

        if (!empty($filters['bookSize'])) {
            $query->where('books.bookSize', $filters['bookSize']);
        }

        if (!empty($filters['from_date'])) {
            $query->whereDate('books.start_time', '>=', $filters['from_date']);
        }

        if (!empty($filters['to_date'])) {
            $query->whereDate('books.start_time', '<=', $filters['to_date']);
        }

        if (isset($filters['status']) && $filters['status'] !== '') {
            $query->where('books.status', (int) $filters['status']);
        }


        $perPage = $filters['per_page'] ?? 10;

        $books = $query
            ->orderByDesc('books.id')
            ->paginate($perPage);


        $books->getCollection()->each(function ($book) {
            $book->categories->each->makeHidden('pivot');
        });

        return $books;
    }


    private function ensureNotEnded(Book $book): void
    {
        if (in_array($book->status, [
            self::STATUS_CANCELLED,
            self::STATUS_COMPLETED
        ])) {
            throw ValidationException::withMessages([
                'status' => ['The book has ended and cannot be modified']
            ]);
        }
    }

    public function processingStatus(): int
    {
        return self::STATUS_PROCESSING;
    }

    public function pendingStatus(): int
    {
        return self::STATUS_PENDING;
    }

    public function cancelledStatus(): int
    {
        return self::STATUS_CANCELLED;
    }

    public function completedStatus(): int
    {
        return self::STATUS_COMPLETED;
    }
}
