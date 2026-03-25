<?php

namespace App\services;

use App\Models\Paper;
use App\Models\Book;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Traits\LogsActivity;
use Illuminate\Validation\Rule;

class PaperService
{
    use LogsActivity;


    private function validatePaper(array $data, bool $isUpdate = false): array
    {
        $rules = [
            'paperSize' => $isUpdate
                ? 'sometimes|required|string|max:50'
                : 'required|string|max:50',

            'paper_coefficient' => $isUpdate
                ? 'sometimes|required|numeric|min:0'
                : 'required|numeric|min:0',
        ];

        return Validator::make($data, $rules)->validate();
    }

    public function getAll(?string $keyword = null)
    {
        return Paper::query()
            ->when(!empty(trim($keyword ?? '')), function ($query) use ($keyword) {
                $query->whereRaw(
                    'LOWER(paperSize) LIKE ?',
                    ['%' . strtolower(trim($keyword)) . '%']
                );
            })
            ->orderByDesc('id')
            ->get();
    }

    public function create(array $data)
    {
        $data = $this->validatePaper($data);
        $data['status'] = 1;

        $paper = Paper::create($data);
        $this->logCreate('paper', $paper->id, $paper->toArray());

        return $paper;
    }

    public function update(int $id, array $data)
    {
        $paper = Paper::findOrFail($id);

        $data = $this->validatePaper($data, true);

        $oldData = $paper->toArray();

        $paper->update($data);

        $this->logUpdate('paper', $paper->id, $oldData, $paper->fresh()->toArray());

        return $paper;
    }

    public function activate(int $id)
    {
        $paper = Paper::findOrFail($id);

        if ($paper->status === 1) {
            return $paper;
        }

        $paper->update(['status' => 1]);

        $this->logUpdate(
            '[paper]',
            $id,
            ['status' => 'Tạm dừng'],
            ['status' => 'Hoạt động']
        );

        return $paper;
    }

    public function deactivate(int $id)
    {
        return DB::transaction(function () use ($id) {

            $paper = Paper::findOrFail($id);
            // $isUsed = Book::where('paper_id', $id)->exists();

            // if ($isUsed) {
            //     throw new \Exception("Cannot deactivate paper because it is assigned to one or more books.");
            // }

            $oldData = $paper->toArray();

            $paper->update(['status' => 0]);

            $this->logUpdate(
                '[paper]',
                $id,
                ['status' => 'Hoạt động'],
                ['status' => 'Tạm dừng']
            );

            return $paper;
        });
    }

    public function getActive()
    {
        return Paper::where('status', 1)
            ->orderBy('id', 'desc')
            ->get();
    }
}
