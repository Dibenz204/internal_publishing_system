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
   
     1. Accept Project (1 -> 2)
   
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
   
    2. Cancel Project (1 -> 0)
   
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
    
    3. Complete Project (2 -> 3)
    
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

    /*
    
    6. Assign Book To Departments
    
    */
    public function assign(Request $request)
{
    $request->validate([
        'book_id' => 'required|exists:books,id',
        'department_ids' => 'required|array',
        'department_ids.*' => 'exists:departments,id',
        'description' => 'nullable|string'
    ]);

    $projects = $this->projectService->assignBookToDepartments(
        $request->book_id,
        $request->department_ids,   
        $request->description      
    );

    return response()->json([
        'success' => true,
        'message' => 'Book assigned to departments successfully.',
        'data'    => $projects
    ], 201);
}
}