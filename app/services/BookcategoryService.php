<?php

namespace App\Services;

use App\Models\Bookcategory;
use Illuminate\Database\Eloquent\Collection;

class BookCategoryService
{
    /**
     * Lấy tất cả
     */
    public function getAll(): Collection
    {
        return Bookcategory::all();
    }

    /**
     * Lấy danh sách đang hoạt động
     */
    public function getActive(): Collection
    {
        return Bookcategory::where('status', 1)->get();
    }

    /**
     * Lấy chi tiết theo ID
     */
    public function getById(int $id): Bookcategory
    {
        return Bookcategory::findOrFail($id);
    }

    /**
     * Tạo mới loại sách
     */
    public function create(array $data): Bookcategory
    {
        $data['status'] = $data['status'] ?? 1;
        return Bookcategory::create($data);
    }

    /**
     * Cập nhật thông tin
     */
    public function update(int $id, array $data): Bookcategory
    {
        $category = Bookcategory::findOrFail($id);
        $category->update($data);

        return $category;
    }

    /**
     *tắt trạng thái
     */
    public function deactivate(int $id): Bookcategory
    {
        $category = Bookcategory::findOrFail($id);
        $category->status = 0;
        $category->save();

        return $category;
    }

    /**
     * Bật lại trạng thái
     */
    public function activate(int $id): Bookcategory
    {
        $category = Bookcategory::findOrFail($id);
        $category->status = 1;
        $category->save();

        return $category;
    }
}