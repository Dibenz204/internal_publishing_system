<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PositionService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PositionController extends Controller
{
    protected $positionService;

    public function __construct(PositionService $positionService)
    {
        $this->positionService = $positionService;
    }

    public function index()
    {
        return response()->json(
            $this->positionService->getAll()
        );
    }

    public function show($id)
    {
        return response()->json(
            $this->positionService->findById($id)
        );
    }

    public function store(Request $request)
    {
        try {
            return response()->json(
                $this->positionService->create($request->all()),
                201
            );
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            return response()->json(
                $this->positionService->update($id, $request->all())
            );
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }
}
