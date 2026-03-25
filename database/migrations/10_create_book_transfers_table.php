<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('book_transfers', function (Blueprint $table) {


            $table->id();

            $table->foreignId('book_id')
                ->constrained('books')
                ->cascadeOnDelete();

            $table->foreignId('from_employee_id')
                ->constrained('employees')
                ->cascadeOnDelete();

            $table->foreignId('to_employee_id')
                ->constrained('employees')
                ->cascadeOnDelete();

            $table->dateTime('start_time');

            $table->dateTime('end_time')->nullable();

            $table->text('note')->nullable();

            $table->unsignedTinyInteger('status')
                ->default(1)
                ->comment('0=CANCELLED,1=PERFORM');

            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('book_transfers');
    }
};
