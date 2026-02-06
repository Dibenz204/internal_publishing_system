<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();

            $table->string('username')->unique();
            $table->string('password');
            $table->boolean('status')->default(1);

            $table->foreignId('employeeId')
                  ->unique() // 1 employee co 1 acc
                  ->constrained('employees')
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
