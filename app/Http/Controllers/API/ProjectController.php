<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\ProjectService;

class ProjectController extends Controller
{
    protected $projectService;

    public function __construct(ProjectService $projectService)
    {
        $this->projectService = $projectService;
    }

    public function accept($id)
    {
        $project = $this->projectService->acceptProject($id);

        return response()->json([
            'success' => true,
            'message' => 'Project accepted successfully.',
            'data'    => $project
        ]);
    }

    public function cancel($id)
    {
        $project = $this->projectService->cancelProject($id);

        return response()->json([
            'success' => true,
            'message' => 'Project cancelled successfully.',
            'data'    => $project
        ]);
    }

    public function search(Request $request)
    {
        $bookName = $request->query('bookName');
        $departmentName = $request->query('departmentName');

        $projects = $this->projectService->searchProject($bookName, $departmentName);

        return response()->json([
            'success' => true,
            'message' => 'Projects retrieved successfully.',
            'data' => $projects
        ]);
    }

    public function booksNotAssigned()
    {
        $books = $this->projectService->booksNotAssigned();

        return response()->json([
            'success' => true,
            'message' => 'Unassigned books retrieved successfully.',
            'data'    => $books
        ]);
    }

    public function assign(Request $request, $bookId)
    {
        $request->validate([
            'department_ids' => 'required|array',
            'department_ids.*' => 'exists:departments,id',
            'description' => 'nullable|string'
        ]);

        try {

            $projects = $this->projectService->assignBookToDepartments(
                $bookId,
                $request->department_ids,
                $request->description
            );

            return response()->json([
                'success' => true,
                'message' => 'Book assigned to departments successfully.',
                'data'    => $projects
            ], 201);
        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }


    public function addDepartmentWhenProcessing(Request $request, $bookId)
    {
        $projects = $this->projectService->addDepartmentWhenProcessing(
            $bookId,
            $request->department_ids ?? [],
            $request->description ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Departments added successfully.',
            'data'    => $projects
        ], 201);
    }

    public function getProjectsByBook($bookId)
    {
        $projects = $this->projectService->getProjectsByBookId($bookId);

        return response()->json([
            'success' => true,
            'message' => 'Projects retrieved successfully.',
            'data'    => $projects
        ]);
    }
}
