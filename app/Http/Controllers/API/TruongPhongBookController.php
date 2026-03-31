<?php


namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Department;
use App\Models\BookTransfer;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TruongPhongBookController extends Controller
{
    protected $projectService;

    public function __construct(ProjectService $projectService)
    {
        $this->projectService = $projectService;
    }


    public function getBooksByDepartmentName($departmentName)
    {
        $user = Auth::user();
        $employee = $user->employee;

        $departmentName = urldecode($departmentName);

        $department = Department::where('name', $departmentName)->first();

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy phòng ban: ' . $departmentName
            ], 404);
        }

        if (!$employee || $employee->department->name != $departmentName) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xem sách của phòng ban này'
            ], 403);
        }

        $projects = Project::with([
            'book',
            'book.assignedEmployee',
            'book.categories',
            'book.paper',
        ])
            ->where('department_id', $department->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $books = $projects->groupBy('book_id')->map(function ($projectGroup) use ($departmentName, $department) {
            $book = $projectGroup->first()->book;
            $currentProject = $projectGroup->first();

            $transferCount = $book->transfers()
                ->whereHas('toEmployee.department', function ($q) use ($departmentName) {
                    $q->where('name', $departmentName);
                })
                ->count();

            $activeTransfer = BookTransfer::with(['toEmployee.department', 'fromEmployee.department'])
                ->where('book_id', $book->id)
                ->where('status', 1)
                ->latest('id')
                ->first();

            $displayStatus = $currentProject->status;

            if ($currentProject->status != $this->projectService::STATUS_COMPLETED && $transferCount >= 2) {
                $displayStatus = $this->projectService::STATUS_ADJUST;
            }

            $book->project_status = $displayStatus;
            $book->original_status = $currentProject->status;
            $book->project_id = $currentProject->id;
            $book->project_description = $currentProject->description;
            $book->transfer_count = $transferCount;

            if ($activeTransfer) {
                $book->current_holder_department = $activeTransfer->toEmployee->department->name ?? null;
                $book->current_holder_name = $activeTransfer->toEmployee->name ?? null;
                $book->current_transfer_id = $activeTransfer->id;
                $book->current_transfer_start_time = $activeTransfer->start_time;
            } else {
                $book->current_holder_department = null;
                $book->current_holder_name = null;
                $book->current_transfer_id = null;
                $book->current_transfer_start_time = null;
            }

            return $book;
        })->values();

        $statusMap = [
            $this->projectService::STATUS_CANCELLED => 'Đã hủy',
            $this->projectService::STATUS_IN_PROGRESS => 'Đang thực hiện',
            $this->projectService::STATUS_PENDING => 'Chờ phân công',
            $this->projectService::STATUS_COMPLETED => 'Hoàn thành',
            $this->projectService::STATUS_ADJUST => 'Điều chỉnh',
        ];

        $colorMap = [
            $this->projectService::STATUS_CANCELLED => '#fce8e6',
            $this->projectService::STATUS_IN_PROGRESS => '#e3f2fd',
            $this->projectService::STATUS_PENDING => '#fff8e1',
            $this->projectService::STATUS_COMPLETED => '#e6f4ea',
            $this->projectService::STATUS_ADJUST => '#f3e5f5',
        ];

        $textColorMap = [
            $this->projectService::STATUS_CANCELLED => '#c62828',
            $this->projectService::STATUS_IN_PROGRESS => '#1565c0',
            $this->projectService::STATUS_PENDING => '#f57f17',
            $this->projectService::STATUS_COMPLETED => '#2e7d32',
            $this->projectService::STATUS_ADJUST => '#6a1b9a',
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'books' => $books,
                'department' => [
                    'id' => $department->id,
                    'name' => $department->name
                ],
                'status_map' => $statusMap,
                'color_map' => $colorMap,
                'text_color_map' => $textColorMap,
            ]
        ]);
    }

    public function cancelProject($projectId)
    {
        try {
            $project = Project::findOrFail($projectId);

            $user = Auth::user();
            $employee = $user->employee;

            if (!$employee || $employee->department->name != $project->department->name) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền hủy project này'
                ], 403);
            }

            if ($project->status != $this->projectService::STATUS_PENDING) {
                return response()->json([
                    'success' => false,
                    'message' => 'Chỉ có thể hủy project đang ở trạng thái chờ xử lý'
                ], 400);
            }

            $updatedProject = $this->projectService->cancelProject($projectId);

            return response()->json([
                'success' => true,
                'data' => $updatedProject,
                'message' => 'Đã hủy project thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }


    public function getProjectDetail($projectId)
    {
        try {
            $project = Project::with([
                'book',
                'book.assignedEmployee',
                'book.categories',
                'book.paper',
                'department'
            ])->findOrFail($projectId);

            $user = Auth::user();
            $employee = $user->employee;

            if (!$employee || $employee->department->name != $project->department->name) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền xem project này'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $project
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
