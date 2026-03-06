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
            $table->id(); //NOT NULL
            $table->string('name'); //NOT NULL
            $table->string('bookCode')->nullable()->unique();
            $table->integer('page')->nullable();
            $table->integer('current_page')->nullable()->default(0);
            $table->text('note')->nullable();

            $table->foreignId('assigned_by')->constrained('employees')->cascadeOnDelete(); //NOT NULL

            $table->foreignId('paper_id')->constrained('papers')->cascadeOnDelete(); // NOT NULL

            $table->unsignedTinyInteger('status')->default(1) //NOT NULL
                ->comment('0=CANCELLED,1=PROCESSING,2=PENDING,3=COMPLETED'); //có 4 trạng thái, sử dụng kiểu unsingedTinyInteger cho đỡ tốn bộ nhớ

            $table->dateTime('start_time'); //NOT NULL
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
