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


            // Book - công việc được đưa đến
            $table->foreignId('book_id')
                  ->constrained('books')
                  ->cascadeOnDelete();


            // Đây là người chuyển việc, phân chia việc
            $table->foreignId('from_employee_id')
                  ->constrained('employees')
                  ->cascadeOnDelete();


            // Đây là người nhận việc
            $table->foreignId('to_employee_id')
                  ->constrained('employees')
                  ->cascadeOnDelete();


            $table->dateTime('start_time');


            $table->dateTime('end_time')->nullable();

            // note không được null vì tkbt dựa vào đây để chuyển qqua phòng tiếp theo
            $table->text('note');

            // 0 = hủy
            // 1 = thực hiện (có nhiều từ quá hong biết ghi từ nào, ghi đại perform nha)
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
