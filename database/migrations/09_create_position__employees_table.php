<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('position_employee', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employeeId')
                  ->constrained('employees')
                  ->cascadeOnDelete();

            $table->foreignId('positionId')
                  ->constrained('positions')
                  ->cascadeOnDelete();

            $table->string('description')->nullable();
            $table->boolean('status')->default(1); 

            $table->unique(['employeeId', 'positionId']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('position_employee');
    }
};
