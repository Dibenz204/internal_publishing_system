<?php

namespace App\Services;

use App\Models\Book;
use App\Models\Bookcategory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class BookService
{
    // Trạng thái sách:
    // 0 - Đã hủy
    // 1 - Đang thực hiện
    // 2 - Chờ xử lý
    // 3 - Hoàn thành
    const STATUS_CANCELLED  = 0;
    const STATUS_PROCESSING = 1;
    const STATUS_PENDING    = 2;
    const STATUS_COMPLETED  = 3;


    // Validate dữ liệu sách
    // Áp dụng cho cả create và update
    // Không cho phép truyền status
    private function validateBook(array $data, ?int $id = null): array
    {
        $rules = [

            // CREATE bắt buộc name, UPDATE thì sometimes
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

            //cho current_page lớn hơn page
            'current_page' => 'nullable|integer|min:0',

            'bookSize' => 'nullable|string|max:50',

            'status' => 'nullable|integer',

            'assigned_by' => 'nullable|exists:employees,id',

            // cho phép null nhưng nếu có thì phải >= thời gian hiện tại
            'end_time' => 'nullable|date|after_or_equal:today',

            // many-to-many
            'categories' => 'sometimes|array',

            // validate từng id category
            'categories.*' => [
                'integer',
                Rule::exists('bookcategories', 'id')
                    ->where('status', 1),
            ],
        ];

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }


    // Lấy danh sách tất cả sách có phân trang
    // Bao gồm nhân viên phụ trách và thể loại
    public function getAll()
    {
        $books = Book::with([
            'assignedEmployee:id,name,email,phone,birthday,sex,status,department_id,position_id,created_at,updated_at',
            'categories:id,name,description,status,created_at,updated_at'
        ])
            ->orderByDesc('id')
            ->get();

        // Ẩn pivot ở categories
        $books->each(function ($book) {
            $book->categories->each->makeHidden(['pivot']);
        });

        return $books;
    }


    // Lấy thông tin chi tiết một cuốn sách theo ID
    // Bao gồm thông tin sách, nhân viên phụ trách và thể loại
    public function findById(int $id)
    {
        $book = Book::with([
            'assignedEmployee',
            'categories'
        ])->findOrFail($id);

        // Ẩn bảng trung gian
        $book->categories->each->makeHidden(['pivot']);

        return $book;
    }


    // Tạo mới sách
    // Mặc định trạng thái là Đang thực hiện
    // Tự động ghi nhận thời gian bắt đầu
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {

            $data = $this->validateBook($data);

            // $data['status'] = self::STATUS_PROCESSING;
            $data['status'] = self::STATUS_PENDING;
            $data['start_time'] = now();

            $categories = $data['categories'] ?? [];
            unset($data['categories']);

            $book = Book::create($data);

            if (!empty($categories)) {

                // Chỉ lấy category có status = 1
                $validCategories = Bookcategory::whereIn('id', $categories)
                    ->where('status', 1)
                    ->pluck('id')
                    ->toArray();

                // Nếu số lượng không khớp -> có category không hợp lệ
                if (count($validCategories) !== count($categories)) {
                    throw new \Exception('One or more categories are inactive or do not exist.');
                }

                $book->categories()->sync($validCategories);
            }

            return $book->fresh(['assignedEmployee', 'categories']);
        });
    }

    // Cập nhật thông tin sách
    // Không cho chỉnh sửa nếu sách đã hủy hoặc đã hoàn thành
    // Không cho phép chỉnh sửa status
    public function update(int $id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {

            $book = Book::findOrFail($id);

            $this->ensureNotEnded($book);

            $validated = $this->validateBook($data, $id);
            unset($validated['status']);

            $categories = $validated['categories'] ?? null;
            unset($validated['categories']);

            $book->update($validated);

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
                'categories'
            ]);
        });
    }


    // Cập nhật tiến độ đọc sách
    // Không cho phép giảm tiến độ
    // Không cho phép vượt quá tổng số trang
    // Nếu đọc hết trang sẽ tự động chuyển sang trạng thái Hoàn thành
    public function updateProgress(int $bookId, int $currentPage)
    {
        return DB::transaction(function () use ($bookId, $currentPage) {

            $book = Book::findOrFail($bookId);
            $this->ensureNotEnded($book);
            //Không được lùi tiến độ
            if ($currentPage < $book->current_page) {
                throw ValidationException::withMessages([
                    'current_page' => ['The progress must not be delayed.']
                ]);
            }
            $book->current_page = $currentPage;
            $book->save();
            return $book;
        });
    }
    // Đánh dấu hoàn thành
    // Không cho phép hoàn thành nếu sách đã hủy hoặc đã hoàn thành trước đó
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

            $book->status = self::STATUS_COMPLETED;
            $book->end_time = now();
            $book->save();

            //Load relation
            $book->load(['assignedEmployee', 'categories']);

            // Ẩn pivot
            $book->categories->each(function ($category) {
                $category->makeHidden('pivot');
            });

            return $book;
        });
    }

    // Hủy sách
    // Không cho phép hủy nếu sách đã hoàn thành
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

            // Load relation
            $book->load(['assignedEmployee', 'categories']);

            $book->categories->each(function ($category) {
                $category->makeHidden('pivot');
            });

            return $book;
        });
    }


    // Tìm kiếm sách theo nhiều điều kiện
    // Có thể tìm theo tên, thể loại, khổ giấy và khoảng thời gian bắt đầu
    public function search(array $filters)
    {
        $query = Book::with([
            'assignedEmployee',
            'categories'
        ]);

        if (!empty($filters['name'])) {
            $query->where('books.name', 'like', '%' . trim($filters['name']) . '%');
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

        //Thêm phân trang
        $perPage = $filters['per_page'] ?? 10;

        $books = $query
            ->orderByDesc('books.id')
            ->paginate($perPage);

        // Ẩn pivot
        $books->getCollection()->each(function ($book) {
            $book->categories->each->makeHidden('pivot');
        });

        return $books;
    }

    // Kiểm tra sách đã kết thúc hay chưa
    // Nếu đã hủy hoặc đã hoàn thành thì không cho phép thao tác
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
