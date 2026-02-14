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

    /**
     * GET /api/positions
     * Có thể filter theo status
     */
    public function index(Request $request)
    {
        return response()->json(
            $this->positionService->getAll($request->query('keyword'))
        );
    }
    
 

    /**
     * POST /api/positions
     */
    public function store(Request $request)
    {
        $position = $this->positionService->create($request->all());

        return response()->json([
            'success' => true,
            'data'    => $position,
        ], 201);
    }

    /**
     * PUT /api/positions/{id}
     */
    public function update(Request $request, int $id)
    {
        $position = $this->positionService->update($id, $request->all());

        return response()->json([
            'success' => true,
            'data'    => $position,
        ]);
    }

    /**
     * PATCH /api/positions/{id}/activate
     */
    public function activate(int $id)
    {
        return response()->json([
            'success' => true,
            'data'    => $this->positionService->activate($id),
        ]);
    }

    /**
     * PATCH /api/positions/{id}/deactivate
     */
    public function deactivate(int $id)
    {
        return response()->json([
            'success' => true,
            'data'    => $this->positionService->deactivate($id),
        ]);
    }
}