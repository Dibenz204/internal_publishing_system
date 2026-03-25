<?php

namespace App\Services;

use App\Models\Position;
use App\Traits\LogsActivity;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PositionService
{
    use LogsActivity;

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
        return DB::transaction(function () use ($data) {

            $validated = $this->validate($data);

            $position = Position::create([
                'name' => $validated['name'],
                'status' => $validated['status'] ?? 1,
            ]);

            $this->logCreate('position', $position->id, $position->toArray());

            return $position;
        });
    }


    public function update(int $id, array $data): Position
    {
        $validated = $this->validate($data, $id);

        return DB::transaction(function () use ($id, $validated) {
            $position = Position::findOrFail($id);

            $oldData = [
                'name' => $position->name
            ];

            $position->update([
                'name' => trim($validated['name']),
            ]);

            $this->logUpdate('position', $position->id, $oldData, [
                $position->name
            ]);

            return $position;
        });
    }


    public function activate(int $id): Position
    {
        $position = $this->changeStatus($id, 1);

        $this->logUpdate(
            'position',
            $id,
            ['status' => 'Tạm dừng'],
            ['status' => 'Hoạt động']
        );

        return $position;
    }


    public function deactivate(int $id): Position
    {
        $position = $this->changeStatus($id, 0);

        $this->logUpdate(
            'position',
            $id,
            ['status' => 'Hoạt động'],
            ['status' => 'Tạm dừng']
        );

        return $position;
    }


    public function changeStatus(int $id, int $status): Position
    {
        if (!in_array($status, [0, 1])) {
            throw ValidationException::withMessages([
                'status' => ['Trạng thái chỉ tồn tại 0 (Tạm dừng) hoặc 1 (Hoạt động)'],
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
                        'Chức vụ này không thể "Tạm dừng" do vẫn còn nhân viên đang hoạt động tại vị trí này'
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
