<?php

namespace App\Services;

use App\Models\JobCategory;

class JobCategoryService
{
    // Lấy tất cả
    public function getAll()
    {
        return JobCategory::all();
    }

    // Lấy những cái đang hoạt động
    public function getActive()
    {
        return JobCategory::where('status', 1)->get();
    }

    // Tạo mới
    public function create($data)
{
    return JobCategory::create([
        'name' => $data['name'],
        'work_coefficient' => $data['work_coefficient'],
        'status' => 1
    ]);
}

    // Chỉ cập nhật name
    public function updateName($id, $data)
    {
        $oldJobCategory = JobCategory::findOrFail($id);
        // tạo bản ghi mới
        $newJobCategory = JobCategory::create([
            'name' => $data['name'],
            'work_coefficient' => $oldJobCategory->work_coefficient,
            'status' => 1
        ]);
        return $newJobCategory;
    }

    // Tắt trạng thái
    public function disable($id){
    $jobCategory = JobCategory::findOrFail($id);

    $jobCategory->status = 0;
    $jobCategory->expired_at = now(); // set thời gian hiện tại

    $jobCategory->save();

    return $jobCategory;}
}