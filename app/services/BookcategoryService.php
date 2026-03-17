<?php

namespace App\Services;

use App\Models\Bookcategory;
use Illuminate\Database\Eloquent\Collection;

class BookCategoryService
{

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
        return Bookcategory::create($data);
    }


    public function update(int $id, array $data): Bookcategory
    {
        $category = Bookcategory::findOrFail($id);

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

        return $category;
    }


    public function deactivate(int $id): Bookcategory
    {
        $category = Bookcategory::findOrFail($id);
        $category->status = 0;
        $category->save();

        return $category;
    }


    public function activate(int $id): Bookcategory
    {
        $category = Bookcategory::findOrFail($id);
        $category->status = 1;
        $category->save();

        return $category;
    }
}
