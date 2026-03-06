<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_categories', function (Blueprint $table) {
            $table->id(); // NOT NULL
            $table->string('name')->unique(); // NOT NULL và duy nhất, k trùng tên
            $table->double('work_coefficient'); // NOT NULL
            $table->boolean('status')->default(1); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_categories');
    }
};