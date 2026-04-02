<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Services\ReportService;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Book;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }


    public function store($allocationId)
    {
        try {

            $report = $this->reportService->createFromAllocation($allocationId);

            return response()->json([
                'message' => 'Create report successfully',
                'data' => $report
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }


    public function myDepartmentReport(Request $request)
    {
        $departmentId = auth()->user()->department_id;

        $data = $this->reportService->getDepartmentReport(
            $departmentId,
            [
                'year' => $request->year,
                'month' => $request->month,
                'employee_name' => $request->employee_name
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function overviewReport(Request $request)
    {
        $data = $this->reportService->getOverviewReport([
            'department_id' => $request->department_id,
            'year' => $request->year,
            'month' => $request->month,
            'employee_name' => $request->employee_name
        ]);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function completedProjects(Request $request)
    {
        $filters = $request->validate([
            'department_id' => 'nullable|exists:departments,id',
            'employee_name' => 'nullable|string|max:255',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date'
        ]);

        $report = $this->reportService->getCompletedProjectsReport($filters);

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    public function departmentReport(Request $request, int $departmentId)
    {
        $filters = $request->validate([
            'employee_name' => 'nullable|string|max:255',
            'employee_id'   => 'nullable|integer|exists:employees,id',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date'
        ]);

        $report = $this->reportService->getDepartmentReport($departmentId, $filters);

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    public function projectDetail(int $projectId)
    {
        try {
            $report = $this->reportService->getProjectReportDetail($projectId);

            return response()->json([
                'success' => true,
                'data' => $report
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dự án hoàn thành với ID: ' . $projectId
            ], 404);
        }
    }

    public function monthlySummary(Request $request)
    {
        $validated = $request->validate([
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|min:2020|max:' . now()->year,
            'department_id' => 'nullable|exists:departments,id'
        ]);

        $month = $validated['month'] ?? now()->month;
        $year = $validated['year'] ?? now()->year;

        $report = $this->reportService->getMonthlySummary(
            $month,
            $year,
            $validated['department_id'] ?? null
        );

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    public function exportDepartmentReport(Request $request, int $departmentId)
    {
        $filters = $request->validate([
            'employee_name' => 'nullable|string|max:255',
            'employee_id'   => 'nullable|integer|exists:employees,id',
            'from_date'     => 'nullable|date',
            'to_date'       => 'nullable|date|after_or_equal:from_date'
        ]);

        $data = $this->reportService->getDepartmentReport($departmentId, $filters);

        // Nếu có filter employee thì dùng template employee
        $template = (!empty($filters['employee_id']) || !empty($filters['employee_name']))
            ? 'reports.employee_report'
            : 'reports.department_report';

        $pdf = Pdf::loadView($template, [
            'rows'            => $data['projects'],
            'total_salary'    => $data['total_salary'],
            'generated_at'    => $data['generated_at'],
            'department_name' => $data['projects'][0]['department'] ?? null,
            'employee_name'   => $filters['employee_name'] ?? ($data['projects'][0]['employee_name'] ?? null),
        ])->setPaper('a4', 'landscape');

        $filename = (!empty($filters['employee_id']) || !empty($filters['employee_name']))
            ? 'employee_report.pdf'
            : 'department_report.pdf';

        return $pdf->stream($filename);
    }

    public function exportBookAllocationsReport($bookId)
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

                $jobs = $allocations->map(fn($a) => $a->jobCategory?->name)->filter()->unique()->values();

                $completedPage = $allocations->filter(function ($allocation) {
                    return $allocation->jobCategory && $allocation->jobCategory->category === 'Biên tập';
                })->sum('completed_page');

                $rows[] = [
                    'employee_name' => $employee?->name,
                    'department'    => $employee?->department?->name,
                    'position'      => $employee?->position?->name,
                    'completed_page' => $completedPage,
                    'jobs'          => $jobs,
                ];
            }
        }

        $pdf = Pdf::loadView('reports.book-allocation-report', [
            'book' => $book,
            'allocations' => $rows,
            'total_pages' => array_sum(array_column($rows, 'completed_page')),
            'generated_date' => now()->format('d/m/Y H:i:s'),
        ])->setPaper('a4', 'landscape');

        return $pdf->stream("allocation-{$book->id}.pdf");
    }
}
