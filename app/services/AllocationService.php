<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Project;
use App\Models\Allocation;
use App\Models\BookTransfer;

class AllocationService
{

    /**
     * Phân công nhân viên vào project
     * - Kiểm tra project tồn tại
     * - Kiểm tra employee tồn tại
     * - Kiểm tra phòng ban của employee có thuộc project
     * - Kiểm tra employee đã được phân công chưa
     * - Nếu hợp lệ thì tạo allocation mới
     */
    public function assignEmployee($projectId, $employeeId, $jobCategoryId, $level = 1)
{
    $project = Project::with('department','book')->findOrFail($projectId);

    $employee = Employee::with('department')->findOrFail($employeeId);

    // kiểm tra phòng ban của nhân viên có thuộc project không
    if ($employee->department_id != $project->department_id) {
        throw new \Exception("Phòng ban của nhân viên không thuộc dự án này");
    }

    // kiểm tra đã phân công chưa
    $exist = Allocation::where('project_id', $projectId)
        ->where('employee_id', $employeeId)
        ->first();

    if ($exist) {
        throw new \Exception("Nhân viên đã được phân công");
    }

    // tạo allocation mới
    return Allocation::create([
        'employee_id' => $employeeId,
        'project_id' => $projectId,
        'job_category_id' => $jobCategoryId,
        'level' => $level,
        'completed_page' => 0,
        'status' => 1
    ]);
}


/**
 * Lấy chi tiết phân công theo book
 * - Lấy toàn bộ allocation thuộc project của book đó
 * - Load các quan hệ: employee, jobCategory, project, department
 */
public function getAllocationDetailByBook($bookId)
{
    return Allocation::with([
        'employee',
        'jobCategory',
        'project.book',
        'project.department'
    ])
    ->whereHas('project', function ($query) use ($bookId) {
        $query->where('book_id', $bookId);
    })
    ->get();
}


/**
 * Xóa nhân viên khỏi allocation
 * - Chỉ cho phép xóa nếu nhân viên chưa làm trang nào
 */
public function removeEmployeeFromAllocation($allocationId)
{
    $allocation = Allocation::findOrFail($allocationId);

    // kiểm tra completed_page
    if ($allocation->completed_page > 0 || $allocation->status >= 1) {
        throw new \Exception("Không thể xóa vì nhân viên đã làm trang");
    }
    $allocation->delete();

    return true;
}


/**
 * Đánh dấu allocation hoàn thành
 * - Chỉ allocation đang làm (status = 1) mới được hoàn thành
 * - Sau khi hoàn thành thì chuyển status = 2
 */
public function completeAllocation($allocationId)
{
    $allocation = Allocation::findOrFail($allocationId);

    // kiểm tra trạng thái
    if ((int)$allocation->status !== 1) {
        throw new \Exception("Chỉ allocation đang làm mới có thể hoàn thành");
    }

    $allocation->update([
        'status' => 2
    ]);

    return $allocation;
}


/**
 * Mở lại project đã hoàn thành
 * - Chỉ project status = 2 mới được
 * - Sau khi mở lại status chuyển về 1
 */
public function reopenProject($projectId)
{
    $project = Project::findOrFail($projectId);

    // chỉ cho phép mở lại khi đã hoàn thành
    if ((int)$project->status !== 2) {
        throw new \Exception("Only completed projects can be reopened");
    }

    $project->update([
        'status' => 1
    ]);

    return $project;
}


/**
 * Mở lại allocation đã hoàn thành
 * - Chỉ allocation status = 2 mới reopen được
 */
public function reopenAllocation($allocationId)
{
    $allocation = Allocation::findOrFail($allocationId);

    if ($allocation->status != 2) {
        throw new \Exception("Only completed allocation can be reopened");
    }

    $allocation->update([
        'status' => 1
    ]);

    return $allocation;
}


/**
 * 
 * - Dùng cho chức năng "công việc của tôi"
 */
public function myAllocations($employeeId)
{
    return Allocation::with([
        'project.book',
        'project.department',
        'jobCategory'
    ])
    ->where('employee_id', $employeeId)
    ->get();
}


/**
 * Cập nhật số trang đã hoàn thành của một allocation
 * Đồng thời tự động cập nhật current_page của BOOK nếu nhân viên thuộc phòng ban "Biên tập"
 */
public function updateCompletedPage($allocationId, $page)
{
    // Tìm allocation theo id
    // đồng thời load quan hệ employee -> department và project -> book
    $allocation = Allocation::with('employee.department','project.book')
        ->findOrFail($allocationId);

    // cập nhật số trang đã hoàn thành của allocation
    $allocation->update([
        'completed_page' => $page
    ]);

    // kiểm tra xem nhân viên có thuộc phòng ban có category = "Biên tập" không
    if ($allocation->employee->department->category === "Biên tập") {

        // lấy id của book mà project đang xử lý
        $bookId = $allocation->project->book_id;

        // tính tổng số trang đã hoàn thành của tất cả allocation thuộc book này
        // thông qua project
        $totalCompleted = Allocation::whereHas('project', function ($q) use ($bookId) {
            $q->where('book_id', $bookId);
        })->sum('completed_page');

        // cập nhật current_page trong bảng books
        // current_page sẽ bằng tổng số trang đã hoàn thành của tất cả nhân viên
        $allocation->project->book->update([
            'current_page' => $totalCompleted
        ]);
    }

    // trả về allocation sau khi đã cập nhật
    return $allocation;
}

}