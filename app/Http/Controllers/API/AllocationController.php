<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AllocationService;
use Illuminate\Support\Facades\Auth;

class AllocationController extends Controller
{

    protected $allocationService;


    public function __construct(AllocationService $allocationService)
    {
        $this->allocationService = $allocationService;
    }

    /**
     * Phân công nhân viên vào project
     *
     */
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


    /**
     * Lấy chi tiết danh sách phân công theo book
     */
    public function allocationDetail(Request $request)
    {
        $bookId = $request->book_id;

        if (!$bookId) {
            return response()->json([
                'success' => false,
                'message' => 'Book ID is required'
            ], 400);
        }

        $data = $this->allocationService->getAllocationDetailByBook($bookId);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }


    /**
     * Xóa nhân viên khỏi allocation
     * Chỉ xóa được nếu nhân viên chưa làm trang nào
     */
    public function removeEmployee($allocationId)
    {

        $this->allocationService->removeEmployeeFromAllocation($allocationId);

        return response()->json([
            'success' => true,
            'message' => 'Employee removed from allocation successfully'
        ]);
    }


    /**
     * Nhân viên đánh dấu hoàn thành công việc
     * Status chuyển sang completed
     */
    public function complete($id)
    {

        $data = $this->allocationService->completeAllocation($id);

        return response()->json([
            'success' => true,
            'message' => 'Task completed successfully',
            'data' => $data
        ]);
    }


    /**
     * Mở lại allocation để tiếp tục chỉnh sửa
     */
    public function reopenAllocation($allocationId)
    {

        $allocation = $this->allocationService->reopenAllocation($allocationId);

        return response()->json([
            'success' => true,
            'message' => 'Allocation reopened successfully',
            'data' => $allocation
        ]);
    }


    /**
     * Lấy danh sách công việc của nhân viên đang đăng nhập
     */
    public function myAllocations()
    {
        $employeeId = Auth::id();

        $data = $this->allocationService->myAllocations($employeeId);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }


    /**
     * Cập nhật số trang đã hoàn thành
     */
    public function updateCompletedPage(Request $request, $allocationId)
    {

        $page = $request->completed_page;

        $data = $this->allocationService->updateCompletedPage($allocationId, $page);

        return response()->json([
            'success' => true,
            'message' => 'Completed pages updated successfully',
            'data' => $data
        ]);
    }

}