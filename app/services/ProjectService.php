<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Book;
use App\Models\Department;
use App\Services\BookService;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    protected $bookService;

    public function __construct(BookService $bookService)
    {
        $this->bookService = $bookService;
    }

    /*
    PROJECT STATUS
    */
    const STATUS_CANCELLED   = 0;
    const STATUS_IN_PROGRESS = 1;
    const STATUS_PENDING     = 2;
    const STATUS_COMPLETED   = 3;
    const STATUS_ADJUST      = 4;


    /*
   
    1. NHẬN DỰ ÁN (2 -> 1)
   
    */
    public function acceptProject($id)
    {
        $project = Project::findOrFail($id);
        // sửa lại chỗ này
        if (!in_array((int)$project->status, [
    self::STATUS_PENDING,
    self::STATUS_ADJUST
    ])) {
            throw new \Exception("Only projects that are pending can be accepted");
        }

        $project->update([
            'status' => self::STATUS_IN_PROGRESS
        ]);

        return $project;
    }


    /*
   
    2. HỦY DỰ ÁN (2 -> 0)
   
    */
    public function cancelProject($id)
    {
        $project = Project::findOrFail($id);

        if ((int) $project->status !== self::STATUS_PENDING) {
            throw new \Exception("Only projects that are pending can be canceled");
        }

        $project->update([
            'status' => self::STATUS_CANCELLED
        ]);

        return $project;
    }


    /*
   
    3. HOÀN THÀNH (1 -> 3)
    
    */
    public function completeProject($id)
    {
        $project = Project::findOrFail($id);

        //Nếu đã hoàn thành rồi
        if ((int) $project->status === self::STATUS_COMPLETED) {
            throw new \Exception("The project has already been completed");
        }

        //Cho phép chỉnh sửa chứ không phải ở trạng thái đang làm rồi chuyển sang hoan thành, sửa lại code để cho phép điều chỉnh
        if (!in_array((int)$project->status, [
        self::STATUS_IN_PROGRESS,
        self::STATUS_ADJUST
        ])) {
            throw new \Exception("You must accept the project before completing it");
        }

        //Cập nhật hoàn thành
        $project->update([
            'status' => self::STATUS_COMPLETED
        ]);

        return $project;
    }


    //Cần chỉnh sửa gì đó               
    public function adjustProject($id)
    {
    $project = Project::findOrFail($id);

    if ((int) $project->status === self::STATUS_CANCELLED) {
        throw new \Exception("Cancelled projects cannot be adjusted");
    }

    $project->update([
        'status' => self::STATUS_ADJUST
    ]);

    return $project;
    }

    /*
   
     4. SEARCH PROJECT
    
    */
    public function searchProject($bookName = null, $departmentName = null)
    {
        return Project::with(['book', 'department'])
            ->when($bookName, function ($query) use ($bookName) {
                $query->whereHas('book', function ($q) use ($bookName) {
                    $q->where('name', 'like', "%$bookName%");
                });
            })
            ->when($departmentName, function ($query) use ($departmentName) {
                $query->whereHas('department', function ($q) use ($departmentName) {
                    $q->where('name', 'like', "%$departmentName%");
                });
            })
            ->get();
    }


    /*
    
    5. SÁCH CHƯA PHÂN CÔNG
   
    */
    public function booksNotAssigned()
    {
        return Book::whereDoesntHave('projects')->get();
    }


    /*
   
    6. PHÂN CÔNG SÁCH
    
    */
    public function assignBookToDepartments($bookId, array $departmentIds, ?string $description = null)
    {
        return DB::transaction(function () use ($bookId, $departmentIds, $description) {

            $book = Book::findOrFail($bookId);

            if ((int) $book->status !== $this->bookService->pendingStatus()) {
                throw new \Exception("Only books with status = Pending can be assigned.");
            }

            $projects = [];

            foreach ($departmentIds as $departmentId) {

                $department = Department::findOrFail($departmentId);

                if ((int) $department->status !== 1) {
                    throw new \Exception("Department ID {$departmentId} is not active.");
                }

                $exists = Project::where('book_id', $bookId)
                    ->where('department_id', $departmentId)
                    ->exists();

                if ($exists) {
                    continue;
                }

                $projects[] = Project::create([
                    'book_id'       => $bookId,
                    'department_id' => $departmentId,
                    'description'   => $description,
                    'status'        => self::STATUS_PENDING
                ]);
            }

            if (!empty($projects)) {
                $book->update([
                    'status' => $this->bookService->processingStatus()
                ]);
            }

            return $projects;
        });
    }

    public function addDepartmentWhenProcessing($bookId, array $departmentIds, ?string $description = null)
    {
        return DB::transaction(function () use ($bookId, $departmentIds, $description) {
    
            $book = Book::findOrFail($bookId);
    
            if ((int) $book->status !== $this->bookService->processingStatus()) {
                throw new \Exception("Only books with status = Processing can add departments.");
            }
    
            $existingDepartmentIds = Project::where('book_id', $bookId)
                ->pluck('department_id')
                ->toArray();
    
            $projects = [];
    
            foreach ($departmentIds as $departmentId) {
    
                $department = Department::findOrFail($departmentId);
    
                if ((int) $department->status !== 1) {
                    throw new \Exception("Department ID {$departmentId} is inactive.");
                }
    
                if (in_array($departmentId, $existingDepartmentIds)) {
                    throw new \Exception("Department ID {$departmentId} is already assigned to this book.");
                }
    
                $projects[] = Project::create([
                    'book_id'       => $bookId,
                    'department_id' => $departmentId,
                    'description'   => $description,
                    'status'        => self::STATUS_PENDING
                ]);
            }
    
            return $projects;
        });
    }
}