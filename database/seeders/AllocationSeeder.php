<?php

namespace Database\Seeders;

use App\Models\Allocation;
use App\Models\Employee;
use App\Models\JobCategory;
use App\Models\Project;
use Illuminate\Database\Seeder;

class AllocationSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();
        $projects = Project::all();
        $jobCategories = JobCategory::all();

        if ($employees->isEmpty() || $projects->isEmpty() || $jobCategories->isEmpty()) {
            $this->command->warn('Thiếu dữ liệu employees, projects hoặc job_categories. Chạy các seeder liên quan trước.');
            return;
        }

        $allocations = [];
        $used = [];
        $count = 0;
        // Nhiều allocation: ít nhất 2 allocation cho mỗi project (nếu đủ combo), tổng ~30+
        $maxRows = max(30, $projects->count() * 2);

        // level: 1 = thành viên, 2 = trưởng nhóm
        // status: 1 = thực hiện, 2 = hoàn thành, 3 = chỉnh sửa
        while ($count < $maxRows) {
            $emp = $employees->random();
            $proj = $projects->random();
            $job = $jobCategories->random();
            $key = "{$emp->id}_{$proj->id}_{$job->id}";

            if (isset($used[$key])) {
                continue;
            }
            $used[$key] = true;

            $allocations[] = [
                'employee_id' => $emp->id,
                'project_id' => $proj->id,
                'job_category_id' => $job->id,
                'level' => $count < 3 ? 2 : 1,
                'completed_page' => rand(0, 150),
                'status' => $count < 4 ? 1 : (rand(1, 3)),
            ];
            $count++;
        }

        foreach ($allocations as $item) {
            Allocation::firstOrCreate(
                [
                    'employee_id' => $item['employee_id'],
                    'project_id' => $item['project_id'],
                    'job_category_id' => $item['job_category_id'],
                ],
                $item
            );
        }

        $this->command->info('Đã seed ' . count($allocations) . ' allocations.');
    }
}
