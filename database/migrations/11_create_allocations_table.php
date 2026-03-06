<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('allocations', function (Blueprint $table) {

            $table->id();

            $table->foreignId('employee_id')
                ->constrained('employees')
                ->cascadeOnDelete();

            $table->foreignId('project_id')
                ->constrained('projects')
                ->cascadeOnDelete();

            $table->foreignId('job_category_id')
                ->constrained('job_categories')
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('level')->default(1);
            $table->integer('completed_page')->default(0);
            $table->boolean('status')->default(1);
            $table->timestamps();

            // tránh trùng phân công
            $table->unique([
                'employee_id',
                'project_id',
                'job_category_id'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('allocations');
    }
};