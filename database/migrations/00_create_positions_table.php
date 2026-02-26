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
        Schema::create('positions', function (Blueprint $table) {
            $table->id(); //NOT NULL
            $table->string('name'); //NOT NULL
            $table->boolean('status')->default(1); //NOT NULL
            $table->timestamps(); //NOT NULL
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('positions');
    }
};
