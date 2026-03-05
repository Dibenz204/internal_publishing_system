<?php

namespace Database\Seeders;

use App\Models\Paper;
use Illuminate\Database\Seeder;

class PaperSeeder extends Seeder
{
    public function run(): void
    {
        $papers = [
            [
                'paperSize' => '19x26.5',
                'paper_coefficient' => 1.23,
                'status' => 1
            ],
            [
                'paperSize' => '17x24',
                'paper_coefficient' => 1.0,
                'status' => 1
            ],
        ];

        foreach ($papers as $item) {
            Paper::firstOrCreate(
                ['paperSize' => $item['paperSize']],
                [
                    'paper_coefficient' => $item['paper_coefficient'],
                    'status' => $item['status']
                ]
            );
        }
    }
}