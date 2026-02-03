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
Schema::create('books', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('bookCode')->unique();
    $table->integer('page');
    $table->integer('currentPage')->default(0);
    $table->string('bookSize');
    $table->boolean('status')->default(1);
    $table->foreignId('assignedBy')->constrained('employees')->cascadeOnDelete();
    $table->foreignId('booktimeId')->constrained('booktimes');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
