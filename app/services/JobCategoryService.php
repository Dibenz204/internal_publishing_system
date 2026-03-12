<?php

namespace App\Services;

use App\Models\JobCategory;
use Illuminate\Support\Facades\DB;

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
        $exists = JobCategory::where('name', $data['name'])
            ->exists();

        if ($exists) {
            throw new \Exception('Job category name already exists.');
        }

        return JobCategory::create([
            'name' => $data['name'],
            'work_coefficient' => $data['work_coefficient'],
            'status' => 1
        ]);
    }

    public function update($id, $data)
    {
        return DB::transaction(function () use ($id, $data) {

            $oldJobCategory = JobCategory::findOrFail($id);

            $oldJobCategory->update([
                'status' => 0,
                'expired_at' => now()
            ]);

            // tạo bản ghi mới
            $newJobCategory = JobCategory::create([
                'work_coefficient' => $data['work_coefficient'] ?? $oldJobCategory->work_coefficient,
                'status' => 1
            ]);
            return $newJobCategory;
        });
    }

    public function disable($id)
    {
        $jobCategory = JobCategory::findOrFail($id);

        $jobCategory->status = 0;
        $jobCategory->expired_at = now(); // set thời gian hiện tại

        $jobCategory->save();

        return $jobCategory;
    }
}
