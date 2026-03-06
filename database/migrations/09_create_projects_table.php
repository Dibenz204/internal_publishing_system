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

            $table->foreignId('department_id')
                ->nullable()
                ->constrained('departments')
                ->nullOnDelete();

            $table->foreignId('book_id') //NOT NULL
                ->constrained('books')
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('status') //NOT NULL
                ->default(1)
                ->comment('0=CANCELLED,1=PROCESSING,2=ACCEPTED,3=COMPLETED'); //có 4 trạng thái, sử dụng kiểu unsignedTinyInteger cho đỡ tốn bộ nhớ

            $table->unique(['department_id', 'book_id']);

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
