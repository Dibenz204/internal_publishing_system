<?php

namespace App\Http\Controllers\Api;

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

    /*
   
     1. Accept Project (2 -> 1)
   
    */
    public function accept($id)
    {
        $project = $this->projectService->acceptProject($id);

        return response()->json([
            'success' => true,
            'message' => 'Project accepted successfully.',
            'data'    => $project
        ]);
    }

    /*
   
    2. Cancel Project (2 -> 0)
   
    */
    public function cancel($id)
    {
        $project = $this->projectService->cancelProject($id);

        return response()->json([
            'success' => true,
            'message' => 'Project cancelled successfully.',
            'data'    => $project
        ]);
    }

    /*
    
    3. Complete Project (1 -> 3)
    
    */
    public function complete($id)
    {
        $project = $this->projectService->completeProject($id);

        return response()->json([
            'success' => true,
            'message' => 'Project completed successfully.',
            'data'    => $project
        ]);
    }

    /*
   
    4. Search Projects
   
    */
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

    /*
   
    5. Books Not Assigned
    
    */
    public function booksNotAssigned()
    {
        $books = $this->projectService->booksNotAssigned();

        return response()->json([
            'success' => true,
            'message' => 'Unassigned books retrieved successfully.',
            'data'    => $books
        ]);
    }



    // 6. Assign Book To Departments

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
     ]);}
 }