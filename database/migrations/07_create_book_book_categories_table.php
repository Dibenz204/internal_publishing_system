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

    $table->foreignId('bookId')
          ->constrained('books')
          ->cascadeOnDelete();

    $table->foreignId('bookcategoryId')
          ->constrained('bookcategories')
          ->cascadeOnDelete();

    $table->unique(['bookId', 'bookcategoryId']);
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
