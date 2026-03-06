<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id(); //NOT NULL
            $table->string('name'); //NOT NULL
            $table->string('email')->unique(); //NOT NULL
            $table->string('phone')->unique(); //NOT NULL
            $table->date('birthday')->nullable();
            $table->boolean('sex')->nullable(); // 1=male,0=female
            $table->foreignId('department_id')->constrained('departments'); //NOT NULL
            $table->foreignId('position_id')->constrained('positions'); //NOT NULL
            $table->boolean('status')->default(1); //NOT NULL
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
