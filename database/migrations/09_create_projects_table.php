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
        Schema::create('projects', function (Blueprint $table) {
            $table->id(); //NOT NULL

            $table->string('description')->nullable();
 
            $table->unsignedTinyInteger('status') //NOT NULL
            ->default(1)
            ->comment('0=cancel,1=accepted,2=processing,3=completed'); //có 4 trạng thái, sử dụng kiểu unsignedTinyInteger cho đỡ tốn bộ nhớ

            $table->foreignId('department_id') 
            ->nullable()
            ->constrained('departments')
            ->nullOnDelete();

            $table->foreignId('book_id') //NOT NULL
            ->constrained('books')
            ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
