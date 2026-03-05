<?php

namespace App\services;

use App\Models\Paper;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Book;

class PaperService
{
    public function create(array $data)
    {
        $data = $this->validatePaper($data);

        // mặc định active khi tạo
        $data['status'] = 1;

        return Paper::create($data);
    }

    public function update(int $id, array $data)
    {
        $paper = Paper::findOrFail($id);

        $data = $this->validatePaper($data, true);

        $paper->update($data);

        return $paper;
    }

    public function activate(int $id)
    {
        return tap(Paper::findOrFail($id))
            ->update(['status' => 1]);
    }

    public function deactivate(int $id)
    {
        return DB::transaction(function () use ($id) {
    
            $paper = Paper::findOrFail($id);
    
            // Kiểm tra xem có book nào đang dùng paper này không
            $isUsed = Book::where('paper_id', $id)->exists();
    
            if ($isUsed) {
                throw new \Exception("Cannot deactivate paper because it is assigned to one or more books.");
            }
    
            $paper->update(['status' => 0]);
    
            return $paper;
        });
    }

    public function getActive()
    {
        return Paper::where('status', 1)
            ->orderBy('id', 'desc')
            ->get();
    }

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
}