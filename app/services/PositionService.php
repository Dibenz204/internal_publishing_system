<?php

namespace App\Services;

use App\Models\Position;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PositionService
{

    public function getAll(?string $keyword = null)
    {
        return Position::query()
            ->when(!empty(trim($keyword ?? '')), function ($query) use ($keyword) {
                $query->whereRaw(
                    'LOWER(name) LIKE ?',
                    ['%' . strtolower(trim($keyword)) . '%']
                );
            })
            ->orderByDesc('id')
            ->get();
    }


    public function create(array $data): Position
    {
        $validated = $this->validate($data);

        return DB::transaction(function () use ($validated) {
            return Position::create([
                'name'   => trim($validated['name']),
                'status' => 1,
            ]);
        });
    }


    public function update(int $id, array $data): Position
    {
        $validated = $this->validate($data, $id);

        return DB::transaction(function () use ($id, $validated) {
            $position = Position::findOrFail($id);

            $position->update([
                'name' => trim($validated['name']),
            ]);

            return $position;
        });
    }


    public function activate(int $id): Position
    {
        return $this->changeStatus($id, 1);
    }


    public function deactivate(int $id): Position
    {
        return $this->changeStatus($id, 0);
    }


    public function changeStatus(int $id, int $status): Position
    {
        if (!in_array($status, [0, 1])) {
            throw ValidationException::withMessages([
                'status' => ['Status must be either 0 or 1.'],
            ]);
        }

        return DB::transaction(function () use ($id, $status) {

            $position = Position::findOrFail($id);

            if (
                $status === 0 &&
                $position->employees()->where('status', 1)->exists()
            ) {

                throw ValidationException::withMessages([
                    'position' => [
                        'The position cannot be deactivated while there are active employees assigned to it.'
                    ],
                ]);
            }

            $position->update([
                'status' => $status
            ]);

            return $position->fresh();
        });
    }

    protected function validate(array $data, ?int $id = null): array
    {
        if (isset($data['name'])) {
            $data['name'] = trim(preg_replace('/\s+/', ' ', $data['name']));
        }

        return validator($data, [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('positions', 'name')->ignore($id),
            ],
            'status' => 'sometimes|in:0,1',
        ])->validate();
    }
}
