<?php

namespace App\Services;

use App\Models\JobCategory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class JobCategoryService
{
    // Lấy tất cả
    public function getAll()
    {
        return JobCategory::orderBy('name')
            ->get();
    }

    // Lấy những cái đang hoạt động
    public function getActive()
    {
        return JobCategory::where('status', 1)->get();
    }

    // Tạo mới
    public function create($data)
    {
        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'category' => 'required|in:Biên tập,Chế bản,Sửa đính chính',
            'work_coefficient' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            throw new \Exception($validator->errors()->first());
        }

        $name = trim(mb_strtolower($data['name']));

        $exists = JobCategory::whereRaw('LOWER(name) = ?', [$name])->exists();

        if ($exists) {
            throw new \Exception('Tên công việc đã tồn tại');
        }

        return JobCategory::create([
            'name' => trim($data['name']),
            'work_coefficient' => $data['work_coefficient'],
            'category' => $data['category'],
            'status' => 1,
            'expired_at' => null
        ]);
    }

    public function update($id, $data)
    {
        return DB::transaction(function () use ($id, $data) {

            $validator = Validator::make($data, [
                'work_coefficient' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                throw new \Exception($validator->errors()->first());
            }
            $oldJobCategory = JobCategory::findOrFail($id);

            if ((int) $oldJobCategory->status !== 1) {
                throw new \Exception('Chỉ có thể chỉnh sửa công việc đang hoạt động.');
            }

            $oldJobCategory->update([
                'status' => 0,
                'expired_at' => now()
            ]);

            // tạo bản ghi mới
            $newJobCategory = JobCategory::create([
                'name' => $oldJobCategory->name,
                'work_coefficient' => $data['work_coefficient'] ?? $oldJobCategory->work_coefficient,
                'category' => $oldJobCategory->category,
                'status' => 1,
                'expired_at' => null
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
