<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AllocationService;
use App\Models\Book;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;


class AllocationController extends Controller
{

    protected $allocationService;


    public function __construct(AllocationService $allocationService)
    {
        $this->allocationService = $allocationService;
    }


    public function assignEmployee(Request $request)
    {

        $data = $this->allocationService->assignEmployee(
            $request->project_id,
            $request->employee_id,
            $request->job_category_id,
            $request->level ?? 1
        );

        return response()->json([
            'success' => true,
            'message' => 'Employee assigned successfully',
            'data' => $data
        ]);
    }

    public function getProjectAllocations($projectId)
    {
        try {
            $result = $this->allocationService->getProjectAllocations($projectId);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function getBookAllocations($bookId)
    {
        try {
            $result = $this->allocationService->getBookAllocations($bookId);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }


    public function removeEmployee($allocationId)
    {

        $this->allocationService->removeEmployeeFromAllocation($allocationId);

        return response()->json([
            'success' => true,
            'message' => 'Task completed successfully'
        ]);
    }


    public function complete($id)
    {

        $data = $this->allocationService->completeAllocation($id);

        return response()->json([
            'success' => true,
            'message' => 'Task completed successfully',
            'data' => $data
        ]);
    }

    public function reopen($id)
    {
        try {
            $data = $this->allocationService->reopenAllocation($id);

            return response()->json([
                'success' => true,
                'message' => 'Mở lại công việc thành công',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function myAllocations()
    {
        $employeeId = Auth::user()->employee->id;

        $data = $this->allocationService->myAllocations($employeeId);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function updateCompletedPage(Request $request, $allocationId)
    {
        try {
            $request->validate([
                'completed_page' => 'required|integer|min:0'
            ]);

            $data = $this->allocationService->updateCompletedPage(
                $allocationId,
                $request->completed_page
            );

            return response()->json([
                'success' => true,
                'message' => 'Completed pages updated successfully',
                'data' => $data
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function getAvailableEmployees($projectId)
    {
        try {
            $employees = $this->allocationService->getAvailableEmployees($projectId);

            return response()->json([
                'success' => true,
                'data' => $employees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function updateJob(Request $request, $allocationId)
    {
        $request->validate([
            'job_category_id' => 'required|integer|exists:job_categories,id'
        ]);

        $allocation = $this->allocationService->updateJob(
            $allocationId,
            $request->job_category_id
        );

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật công việc thành công',
            'data' => $allocation
        ]);
    }

    public function getBookAllocationsReport($bookId)
    {
        $book = Book::with([
            'paper',
            'projects.allocations.employee.department',
            'projects.allocations.employee.position',
            'projects.allocations.jobCategory',
        ])->findOrFail($bookId);

        if ($book->status !== 3) {
            return response()->json(['success' => false, 'message' => 'Sách chưa hoàn thành'], 400);
        }

        $rows = [];
        foreach ($book->projects as $project) {
            $grouped = $project->allocations->groupBy('employee_id');
            foreach ($grouped as $employeeId => $allocations) {
                $employee = $allocations->first()->employee;

                // Lấy tất cả job names (hiển thị đầy đủ)
                $jobs = $allocations->map(fn($a) => $a->jobCategory?->name)->filter()->unique()->values();

                // Chỉ tính tổng completed_page cho các job có category = "Biên tập"
                $completedPage = $allocations->filter(function ($allocation) {
                    return $allocation->jobCategory && $allocation->jobCategory->category === 'Biên tập';
                })->sum('completed_page');

                $rows[] = [
                    'employee_name' => $employee?->name,
                    'department'    => $employee?->department?->name,
                    'position'      => $employee?->position?->name,
                    'completed_page' => $completedPage,
                    'jobs'          => $jobs, // vẫn hiển thị tất cả công việc
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'book' => [
                    'id'        => $book->id,
                    'name'      => $book->name,
                    'bookCode'  => $book->bookCode,
                    'page'      => $book->page,
                    'paper'     => $book->paper?->paperSize,
                ],
                'allocations' => $rows,
            ]
        ]);
    }
}
