<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Book;
use App\Models\Department;
use App\Services\BookService;
use App\Traits\LogsActivity;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    use LogsActivity;

    protected $bookService;

    public function __construct(BookService $bookService)
    {
        $this->bookService = $bookService;
    }

    const STATUS_CANCELLED   = 0;
    const STATUS_IN_PROGRESS = 1;
    const STATUS_PENDING     = 2;
    const STATUS_COMPLETED   = 3;
    const STATUS_ADJUST      = 4; //đang chưa sử dụng

    public function acceptProject($id)
    {
        $project = Project::findOrFail($id);
        if (!in_array((int)$project->status, [
            self::STATUS_PENDING,
            self::STATUS_ADJUST
        ])) {
            throw new \Exception("Chỉ những dự án đang đợi mới được chấp thuận");
        }

        $project->update([
            'status' => self::STATUS_IN_PROGRESS
        ]);

        $this->logUpdate(
            'project',
            $project->id,
            ['status' => 'Đang đợi'],
            ['status' => 'Thực hiện']
        );

        return $project;
    }

    public function cancelProject($id)
    {
        $project = Project::findOrFail($id);

        if ((int) $project->status !== self::STATUS_PENDING) {
            throw new \Exception("Chỉ những dự án đang đợi mới được hủy");
        }

        $project->update([
            'status' => self::STATUS_CANCELLED
        ]);

        $this->logUpdate(
            'project',
            $project->id,
            ['status' => 'Đang đợi'],
            ['status' => 'Hủy']
        );

        return $project;
    }

    public function completeProject($id)
    {
        $project = Project::findOrFail($id);

        if ((int) $project->status === self::STATUS_COMPLETED) {
            throw new \Exception("Dự án công việc này đã được đánh dấu hoàn thành trước đó");
        }

        if ((int) $project->status !== self::STATUS_IN_PROGRESS) {
            throw new \Exception("Chỉ có thể hoàn thành nếu dự án đang được thực hiện tại phòng ban");
        }

        $project->update([
            'status' => self::STATUS_COMPLETED
        ]);

        $this->logUpdate(
            'project',
            $project->id,
            ['status' => 'Thực hiện'],
            ['status' => 'Hoàn thành']
        );

        return $project;
    }

    //Hiện giờ chưa sử dụng
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

    public function booksNotAssigned()
    {
        return Book::whereDoesntHave('projects')->get();
    }

    public function assignBookToDepartments($bookId, array $departmentIds, ?string $description = null)
    {
        return DB::transaction(function () use ($bookId, $departmentIds, $description) {

            $book = Book::findOrFail($bookId);

            if ((int) $book->status !== $this->bookService->pendingStatus()) {
                throw new \Exception("Chỉ phân công khi sách đang ở trạng thái chờ thực hiện");
            }

            $projects = [];
            $createdProjects = [];

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

                $project = Project::create([
                    'book_id'       => $bookId,
                    'department_id' => $departmentId,
                    'description'   => $description,
                    'status'        => self::STATUS_PENDING
                ]);

                $projects[] = $project;
                $createdProjects[] = $project->load(['book', 'department']);
            }



            if (!empty($projects)) {
                $book->update([
                    'status' => $this->bookService->processingStatus()
                ]);
            }

            foreach ($createdProjects as $project) {
                $this->logCreate('project', $project->id, [
                    'id' => $project->id,
                    'book' => [
                        'id' => $book->id,
                        'name' => $book->name,
                        'bookCode' => $book->bookCode,
                    ],
                    'department' => [
                        'id' => $project->department->id,
                        'name' => $project->department->name,
                    ],
                    'description' => $project->description,
                    'status' => $project->status
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

                $project = Project::create([
                    'book_id'       => $bookId,
                    'department_id' => $departmentId,
                    'description'   => $description,
                    'status'        => self::STATUS_PENDING
                ]);

                $projects[] = $project;
                $createdProjects[] = $project->load(['book', 'department']);

                foreach ($createdProjects as $project) {
                    $this->logCreate('project', $project->id, [
                        'id' => $project->id,
                        'book' => [
                            'id' => $book->id,
                            'name' => $book->name,
                            'bookCode' => $book->bookCode,
                        ],
                        'department' => [
                            'id' => $project->department->id,
                            'name' => $project->department->name,
                        ],
                        'description' => $project->description,
                        'status' => $project->status,
                        'action' => 'add department when processing'
                    ]);
                }
            }

            return $projects;
        });
    }

    public function getProjectsByBookId(int $bookId)
    {
        $book = Book::findOrFail($bookId);

        return Project::with(['book', 'department'])
            ->where('book_id', $bookId)
            ->get();
    }
}
