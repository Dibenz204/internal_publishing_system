<?php

namespace App\Services;

use App\Models\Position;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PositionService
{
    /**
     * Lấy danh sách position
     */
    public function getAll()
    {
        return Position::all();
    }

    /**
     * Lấy position theo id
     */
    public function findById(int $id)
    {
        return Position::findOrFail($id);
    }

    /**
     * Tạo mới position
     */
    public function create(array $data)
    {
        $this->validate($data);

        return DB::transaction(function () use ($data) {
            return Position::create([
                'name' => $data['name'],
            ]);
        });
    }

    /**
     * Cập nhật position
     */
    public function update(int $id, array $data)
    {
        $this->validate($data, $id);

        return DB::transaction(function () use ($id, $data) {
            $position = Position::findOrFail($id);

            $position->update([
                'name' => $data['name'],
            ]);

            return $position;
        });
    }

    /**
     * Validate dữ liệu
     */
    protected function validate(array $data, $id = null)
    {
        $rule = 'required|string|max:255|unique:positions,name';

        if ($id) {
            $rule .= ',' . $id;
        }

        validator($data, [
            'name' => $rule,
        ])->validate();
    }
}
