<?php

namespace App\Http\Controllers\Api;

use App\Services\PaperService;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PaperController extends Controller
{
    protected $paperService;

    public function __construct(PaperService $paperService)
    {
        $this->paperService = $paperService;
    }

    public function store(Request $request)
    {
        $paper = $this->paperService->create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Paper created successfully',
            'data' => $paper
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $paper = $this->paperService->update($id, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Paper updated successfully',
            'data' => $paper
        ]);
    }

    public function activate(int $id)
    {
        $paper = $this->paperService->activate($id);

        return response()->json([
            'success' => true,
            'message' => 'Paper activated successfully',
            'data' => $paper
        ]);
    }

    public function deactivate(int $id)
    {
        $paper = $this->paperService->deactivate($id);

        return response()->json([
            'success' => true,
            'message' => 'Paper deactivated successfully',
            'data' => $paper
        ]);
    }

    public function getActive()
    {
        $papers = $this->paperService->getActive();

        return response()->json([
            'success' => true,
            'message' => 'Get paper active successfully',
            'data' => $papers
        ]);
    }
}
