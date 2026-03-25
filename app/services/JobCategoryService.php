<?php

namespace App\Services;

use App\Models\JobCategory;
use App\Traits\LogsActivity;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class JobCategoryService
{
    use LogsActivity;

    public function getAll()
    {
        return JobCategory::orderBy('name')
            ->get();
    }


    public function getActive()
    {
        return JobCategory::where('status', 1)->get();
    }


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

        $jobcategory = JobCategory::create([
            'name' => trim($data['name']),
            'work_coefficient' => $data['work_coefficient'],
            'category' => $data['category'],
            'status' => 1,
            'expired_at' => null
        ]);

        $this->logCreate('jobcategory', $jobcategory->id, $jobcategory->toArray());

        return $jobcategory;
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

            $oldData = [
                'id' => $oldJobCategory->id,
                'name' => $oldJobCategory->name,
                'category' => $oldJobCategory->category,
                'work_coefficient' => $oldJobCategory->work_coefficient,
                'status' => $oldJobCategory->status,
                'expired_at' => now(),
            ];

            if ((int) $oldJobCategory->status !== 1) {
                throw new \Exception('Chỉ có thể chỉnh sửa công việc đang hoạt động.');
            }

            $oldJobCategory->update([
                'status' => 0,
                'expired_at' => now()
            ]);

            $newJobCategory = JobCategory::create([
                'name' => $oldJobCategory->name,
                'work_coefficient' => $data['work_coefficient'] ?? $oldJobCategory->work_coefficient,
                'category' => $oldJobCategory->category,
                'status' => 1,
                'expired_at' => null
            ]);

            $this->logUpdate('jobcategory', $newJobCategory->id, $oldData, $newJobCategory->toArray());

            return $newJobCategory;
        });
    }

    public function getByCategory($category)
    {
        return JobCategory::where('category', $category)
            ->where('status', 1)
            ->orderBy('name')
            ->get(['id', 'name', 'work_coefficient', 'category']);
    }


    public function getAllGroupedByCategory()
    {
        $categories = JobCategory::where('status', 1)
            ->orderBy('name')
            ->get()
            ->groupBy('category');

        return [
            'BienTap' => $categories['Biên tập'] ?? collect(),
            'DinhChinh' => $categories['Đính chính'] ?? collect(),
            'SuaBai' => $categories['Sửa bài'] ?? collect(),
        ];
    }
}
