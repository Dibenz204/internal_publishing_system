<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PositionService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PositionController extends Controller
{
    protected PositionService $positionService;

    public function __construct(PositionService $positionService)
    {
        $this->positionService = $positionService;
    }


    public function index(Request $request)
    {
        $positions = $this->positionService->getAll(
            $request->query('keyword')
        );

        return response()->json([
            'success' => true,
            'message' => 'List retrieved successfully',
            'data'    => $positions
        ], 200);
    }



    public function store(Request $request)
    {
        $position = $this->positionService->create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Position created successfully',
            'data'    => $position,
        ], 201);
    }


    public function update(Request $request, int $id)
    {
        $position = $this->positionService->update($id, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Updated successfully',
            'data'    => $position,
        ]);
    }


    public function activate(int $id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Status has been changed to 1',
            'data'    => $this->positionService->activate($id),
        ]);
    }


    public function deactivate(int $id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Status has been changed to 0',
            'data'    => $this->positionService->deactivate($id),
        ]);
    }
}
