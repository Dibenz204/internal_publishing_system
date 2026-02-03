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
 Schema::create('book_book_categories', function (Blueprint $table) {
            $table->id();
            // khóa ngoại employee
            $table->foreignId('employeeId')->constrained('employees')->cascadeOnDelete();
            // khóa ngoại bookcategory
            $table->foreignId('bookcategoryId')->constrained('bookcategories')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['employeeId', 'bookcategoryId']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_book_categories');
    }
};
