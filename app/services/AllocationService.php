<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Project;
use App\Models\Allocation;
use App\Models\BookTransfer;
use App\Models\JobCategory;
use App\Models\Book;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Traits\LogsActivity;
use App\Models\AuditLog;

class AllocationService
{
    use LogsActivity;

    public function assignEmployee($projectId, $employeeId, $jobCategoryId, $level = 1)
    {

        return DB::transaction(function () use ($projectId, $employeeId, $jobCategoryId, $level) {

            $project = Project::with('department', 'book')->findOrFail($projectId);

            $employee = Employee::with('department')->findOrFail($employeeId);
            if ($employee->status != 1) {
                throw new \Exception("Nhân viên không hoạt động");
            }

            if ($employee->department_id != $project->department_id) {
                throw new \Exception("Phòng ban của nhân viên không thuộc dự án này");
            }

            $jobCategory = JobCategory::where('id', $jobCategoryId)
                ->where('status', 1)
                ->first();

            if (!$jobCategory) {
                throw new \Exception("Job category không tồn tại hoặc không hoạt động");
            }

            $existingAllocation = Allocation::where('project_id', $projectId)
                ->where('employee_id', $employeeId)
                ->whereHas('jobCategory', function ($query) use ($jobCategory) {
                    $query->where('category', $jobCategory->category);
                })
                ->first();

            if ($existingAllocation) {
                throw new \Exception("Nhân viên đã được phân công công việc thuộc phần '{$jobCategory->category}' trong dự án này");
            }

            $allocation = Allocation::create([
                'employee_id' => $employeeId,
                'project_id' => $projectId,
                'job_category_id' => $jobCategoryId,
                'level' => $level,
                'completed_page' => 0,
                'status' => 1
            ]);

            if ($project->status != 1) {
                $project->update([
                    'status' => 1
                ]);
            }

            $this->logCreate('allocation', $allocation->id, [
                'project_id'   => $projectId,
                'employee'     => $employee->name,
                'job_category' => $jobCategory->name,
                'level'        => $level,
            ]);

            return $allocation->load([
                'employee.department',
                'project.department',
                'jobCategory'
            ]);
        });
    }

    public function getProjectAllocations($projectId)
    {
        $project = Project::with(['book', 'department'])->findOrFail($projectId);

        $allocations = Allocation::where('project_id', $projectId)
            ->with([
                'employee:id,name,email',
                'jobCategory:id,name,work_coefficient,category'
            ])
            ->get()
            ->map(function ($allocation) {

                return [
                    'id' => $allocation->id,
                    'employee' => [
                        'id' => $allocation->employee->id,
                        'name' => $allocation->employee->name,
                        'email' => $allocation->employee->email,
                    ],
                    'job' => [
                        'id' => $allocation->jobCategory->id,
                        'name' => $allocation->jobCategory->name,
                        'category' => $allocation->jobCategory->category,
                        'work_coefficient' => (float) $allocation->jobCategory->work_coefficient,
                    ],
                    'level' => $allocation->level,
                    'completed_page' => $allocation->completed_page,
                    'status' => $allocation->status,

                    'created_at' => $allocation->created_at->format('d/m/Y H:i'),
                    'updated_at' => $allocation->updated_at->format('d/m/Y H:i'),
                ];
            });

        return [
            'project' => [
                'id' => $project->id,
                'book_name' => $project->book->name ?? 'N/A',
                'department_name' => $project->department->name ?? 'N/A',
                'description' => $project->description,
                'status' => $project->status,
            ],
            'allocations' => $allocations
        ];
    }


    public function getBookAllocations($bookId)
    {
        $book = Book::findOrFail($bookId);

        $projects = Project::where('book_id', $bookId)
            ->with(['department'])
            ->get();

        $result = [];

        foreach ($projects as $project) {

            $allocations = Allocation::where('project_id', $project->id)
                ->with([
                    'employee:id,name,email',
                    'jobCategory:id,name,work_coefficient,category'
                ])
                ->get()
                ->map(function ($allocation) {
                    return [
                        'id' => $allocation->id,
                        'employee' => [
                            'id' => $allocation->employee->id,
                            'name' => $allocation->employee->name,
                            'email' => $allocation->employee->email,
                        ],
                        'job' => [
                            'id' => $allocation->jobCategory->id,
                            'name' => $allocation->jobCategory->name,
                            'category' => $allocation->jobCategory->category,
                            'work_coefficient' => (float) $allocation->jobCategory->work_coefficient,
                        ],
                        'level' => $allocation->level,
                        'completed_page' => $allocation->completed_page,
                        'status' => $allocation->status,
                        'created_at' => $allocation->created_at->format('d/m/Y H:i'),
                        'updated_at' => $allocation->updated_at->format('d/m/Y H:i'),
                    ];
                });

            $result[] = [
                'project_id' => $project->id,
                'department_name' => $project->department->name ?? 'N/A',
                'project_description' => $project->description,
                'project_status' => $project->status,
                'allocations' => $allocations
            ];
        }

        return [
            'book' => [
                'id' => $book->id,
                'name' => $book->name,
                'bookCode' => $book->bookCode,
            ],
            'projects' => $result
        ];
    }


    public function removeEmployeeFromAllocation($allocationId)
    {
        return DB::transaction(function () use ($allocationId) {
            $allocation = Allocation::with('employee', 'jobCategory')
                ->findOrFail($allocationId);

            $oldData = [
                'project_id'   => $allocation->project_id,
                'employee'     => $allocation->employee->name,
                'job_category' => $allocation->jobCategory->name,
            ];

            if ($allocation->completed_page > 0 || $allocation->status == 2) {
                throw new \Exception("Không thể xóa vì nhân viên đã có tiến độ");
            }
            $allocation->delete();

            $this->logDelete('allocation', $allocationId, $oldData);

            return true;
        });
    }


    public function completeAllocation($allocationId)
    {
        $allocation = Allocation::findOrFail($allocationId);

        if ((int)$allocation->status !== 1) {
            throw new \Exception("Chỉ allocation đang làm mới có thể hoàn thành");
        }

        if ((int)$allocation->completed_page === 0) {
            throw new \Exception("Không thể hoàn thành khi chưa có tiến độ");
        }

        $allocation->update([
            'status' => 2
        ]);

        $this->logUpdate(
            'allocation',
            $allocationId,
            ['status' => 'Đang thực hiện'],
            ['status' => 'Hoàn thành']
        );

        return $allocation;
    }


    public function reopenAllocation($allocationId)
    {
        $allocation = Allocation::with('project.book')->findOrFail($allocationId);

        if ((int)$allocation->status !== 2) {
            throw new \Exception("Chỉ allocation đã hoàn thành mới có thể mở lại");
        }

        $bookStatus = (int)$allocation->project->book->status;
        if ($bookStatus === 3 || $bookStatus === 0) {
            throw new \Exception("Sách đã hoàn thành hoặc đã hủy nên không thể thao tác");
        }

        $allocation->update([
            'status' => 1
        ]);

        $this->logUpdate(
            'allocation',
            $allocationId,
            ['status' => 'Hoàn thành'],
            ['status' => 'Đang thực hiện']
        );

        return $allocation;
    }

    public function myAllocations($employeeId)
    {
        $allocations = Allocation::with([
            'project.book',
            'project.department',
            'jobCategory'
        ])
            ->where('employee_id', $employeeId)
            ->orderBy('created_at', 'desc')
            ->get();

        $bookIds = $allocations->pluck('project.book_id')->unique()->filter();

        $activeTransfers = \App\Models\BookTransfer::with(['toEmployee.department'])
            ->whereIn('book_id', $bookIds)
            ->where('status', 1)
            ->get()
            ->keyBy('book_id');

        return $allocations->map(function ($allocation) use ($activeTransfers) {
            $bookId = $allocation->project->book_id ?? null;
            $activeTransfer = $bookId ? ($activeTransfers[$bookId] ?? null) : null;

            $allocation->project->book->current_holder_department =
                $activeTransfer?->toEmployee?->department?->name ?? null;

            return $allocation;
        });
    }


    public function updateCompletedPage($allocationId, $page)
    {
        return DB::transaction(function () use ($allocationId, $page) {

            $allocation = Allocation::with(
                'employee.department',
                'project.book',
                'jobCategory'
            )->findOrFail($allocationId);

            $oldPage = $allocation->completed_page;

            $book = $allocation->project->book;

            if (in_array($book->status, [3, 0])) {
                throw new \Exception("Không thể cập nhật tiến độ vì sách đã hoàn thành hoặc đã bị hủy");
            }

            $currentTransfer = BookTransfer::where('book_id', $book->id)
                ->where('status', 1)
                ->latest('id')
                ->first();

            if (!$currentTransfer) {
                throw new \Exception("Không tìm thấy transfer đang hoạt động cho sách này");
            }

            $toEmployee = Employee::with('department')->find($currentTransfer->to_employee_id);

            if (!$toEmployee) {
                throw new \Exception("Không tìm thấy thông tin người nhận transfer");
            }

            if ($allocation->employee->department_id != $toEmployee->department_id) {
                throw new \Exception("Không thể cập nhật: Sách hiện đang ở phòng ban khác");
            }

            $allocation->update([
                'completed_page' => $page
            ]);

            $this->logUpdate(
                'allocation',
                $allocationId,
                ['completed_page' => $oldPage],
                ['completed_page' => $page]
            );

            if (
                $allocation->employee->department->category === "Biên tập"
                && $allocation->jobCategory->category === "Biên tập"
            ) {

                $bookId = $allocation->project->book_id;

                $totalCompleted = Allocation::whereHas('project', function ($q) use ($bookId) {
                    $q->where('book_id', $bookId);
                })
                    ->whereHas('jobCategory', function ($q) {
                        $q->where('category', 'Biên tập');
                    })
                    ->lockForUpdate()
                    ->sum('completed_page');

                $allocation->project->book()->lockForUpdate()->update([
                    'current_page' => $totalCompleted
                ]);
            }

            return $allocation->fresh();
        });
    }

    public function getAvailableEmployees($projectId)
    {
        $project = Project::findOrFail($projectId);

        $employees = Employee::where('department_id', $project->department_id)
            ->where('status', 1)
            ->get(['id', 'name', 'email']);

        $allocations = Allocation::where('project_id', $projectId)
            ->with('jobCategory:id,category')
            ->get()
            ->groupBy('employee_id');

        return $employees->map(function ($employee) use ($allocations) {
            $empAllocations = $allocations->get($employee->id, collect());
            $assignedCategories = $empAllocations->pluck('jobCategory.category')->unique()->values()->toArray();

            return [
                'id' => $employee->id,
                'name' => $employee->name,
                'email' => $employee->email,
                'assigned_categories' => $assignedCategories,
            ];
        })->values();
    }

    public function updateJob($allocationId, $newJobCategoryId)
    {
        return DB::transaction(function () use ($allocationId, $newJobCategoryId) {
            $allocation = Allocation::with('jobCategory')->findOrFail($allocationId);

            $newJob = JobCategory::where('id', $newJobCategoryId)
                ->where('status', 1)
                ->first();

            if (!$newJob) {
                throw new \Exception("Công việc không tồn tại hoặc không hoạt động");
            }

            if ($newJob->category !== $allocation->jobCategory->category) {
                throw new \Exception("Chỉ được cập nhật công việc trong cùng thể loại '{$allocation->jobCategory->category}'");
            }

            $oldData = ['job_category' => $allocation->jobCategory->name];

            $allocation->update(['job_category_id' => $newJobCategoryId]);

            $this->logUpdate('allocation', $allocationId, $oldData, [
                'job_category' => $newJob->name,
            ]);

            return $allocation->fresh(['employee', 'jobCategory']);
        });
    }
}
