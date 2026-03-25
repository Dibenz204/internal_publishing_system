<?php

namespace App\Services;

use App\Models\Bookcategory;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Collection;

class BookCategoryService
{
    use LogsActivity;

    public function getAll(): Collection
    {
        return Bookcategory::all();
    }


    public function getActive(): Collection
    {
        return Bookcategory::where('status', 1)->get();
    }


    public function getById(int $id): Bookcategory
    {
        return Bookcategory::findOrFail($id);
    }


    public function create(array $data): Bookcategory
    {
        $name = trim(mb_strtolower($data['name']));

        $exists = Bookcategory::whereRaw('LOWER(name) = ?', [$name])->exists();

        if ($exists) {
            throw new \Exception('Tên danh mục sách đã tồn tại');
        }

        $data['status'] = 1;

        $category = Bookcategory::create($data);

        $this->logCreate('bookcategory', $category->id, [
            'name' => $category->name,
            'description' => $category->description
        ]);

        return $category;
    }


    public function update(int $id, array $data): Bookcategory
    {
        $category = Bookcategory::findOrFail($id);

        $oldData = $category->toArray();

        if (isset($data['name'])) {

            $name = trim(mb_strtolower($data['name']));

            $exists = Bookcategory::whereRaw('LOWER(name) = ?', [$name])
                ->where('id', '!=', $id)
                ->exists();

            if ($exists) {
                throw new \Exception('Tên danh mục sách đã tồn tại');
            }
        }

        $category->update($data);

        $this->logUpdate('bookcategory', $category->id, $oldData, $category->fresh()->toArray());

        return $category;
    }


    public function deactivate(int $id): Bookcategory
    {
        $category = Bookcategory::findOrFail($id);
        $category->status = 0;
        $category->save();

        $this->logUpdate(
            'bookcategory',
            $id,
            ['status' => 'Hoạt động'],
            ['status' => 'Đã dừng']
        );

        return $category;
    }


    public function activate(int $id): Bookcategory
    {
        $category = Bookcategory::findOrFail($id);
        $category->status = 1;
        $category->save();

        $this->logUpdate(
            'bookcategory',
            $id,
            ['status' => 'Đã dừng'],
            ['status' => 'Hoạt động']
        );

        return $category;
    }
}
