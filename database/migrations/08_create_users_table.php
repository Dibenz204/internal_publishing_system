<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); //NOT NULL
            $table->string('username')->unique(); //NOT NULL
            $table->string('password'); //NOT NULL
            $table->boolean('status')->default(1); //NOT NULL

            $table->foreignId('employee_id')
            ->nullable()
            ->unique() 
            ->constrained('employees')
            ->cascadeOnDelete();

            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
