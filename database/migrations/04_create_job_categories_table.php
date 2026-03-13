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
            $table->string('name'); // NOT NULL
            $table->decimal('work_coefficient', 8, 5); // NOT NULL
            $table->string('category');
            $table->boolean('status')->default(1);
            $table->timestamps();
            $table->timestamp('expired_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_categories');
    }
};
