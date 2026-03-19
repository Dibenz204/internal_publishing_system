<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Project;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PositionSeeder::class,
            DepartmentSeeder::class,
            UserDataSeeder::class,
            BookcategorySeeder::class,
            PaperSeeder::class,
            BookSeeder::class,
            // BookTransferSeeder::class,
            ProjectSeeder::class,
            JobCategorySeeder::class,
            SalaryCoefficientSeeder::class,
            // AllocationSeeder::class,
            // ReportSeeder::class,
            // AllocationSeeder::class,
            // ReportSeeder::class,
            // EmployeeSeeder::class,
        ]);

        //php artisan db:seed
    }
}
