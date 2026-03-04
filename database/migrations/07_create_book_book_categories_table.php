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
            $table->id(); //NOT NULL

            $table->foreignId('book_id') //NOT NULL
            ->constrained('books')
            ->cascadeOnDelete();

            $table->foreignId('bookcategory_id') //NOT NULL
            ->constrained('bookcategories')
            ->cascadeOnDelete();

            $table->string('status')->default('active'); //NOT NULL
            $table->unique(['book_id', 'bookcategory_id']); //NOT NULL
            $table->timestamps();
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
