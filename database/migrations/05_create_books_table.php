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
            $table->string('bookCode')->nullable()->unique();
            $table->integer('page')->nullable();
            $table->integer('current_page')->nullable()->default(0);
            $table->text('note')->nullable();

            $table->foreignId('assigned_by')->constrained('employees')->cascadeOnDelete();

            $table->foreignId('paper_id')->constrained('papers')->cascadeOnDelete();

            $table->unsignedTinyInteger('status')->default(1)
                ->comment('0=CANCELLED,1=PROCESSING,2=PENDING,3=COMPLETED');

            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
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
