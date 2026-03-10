<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {

            $table->id();

            $table->foreignId('allocation_id')
                ->constrained('allocations')
                ->cascadeOnDelete();

            $table->foreignId('project_id')
                ->constrained('projects')
                ->cascadeOnDelete();

            $table->foreignId('salary_coefficient_id')
                ->constrained('salary_coefficients')
                ->cascadeOnDelete();

            $table->integer('conversion_page'); //trang quy đổi
            $table->decimal('salary', 12, 2);

            $table->text('note')->nullable();

            $table->year('report_year');
            $table->tinyInteger('report_month');

            $table->tinyInteger('status')->default(1);
            $table->index(['report_year', 'report_month']);


            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
