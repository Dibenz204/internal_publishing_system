<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Báo cáo thực hiện sách</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            position: relative;
        }
        
        .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .date-info {
            text-align: right;
            font-size: 11px;
            color: #888;
            margin-top: 5px;
            margin-bottom: 15px;
        }
        
        .book-info {
            margin-bottom: 20px;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 5px;
        }
        
        .book-info table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .book-info td {
            padding: 5px;
            font-size: 12px;
        }
        
        .book-info td.label {
            font-weight: bold;
            width: 100px;
        }
        
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        .data-table th {
            background: #1a3a6b;
            color: white;
            padding: 8px 6px;
            font-size: 10px;
            text-align: center;
            border: 1px solid #ddd;
        }
        
        .data-table td {
            padding: 6px;
            border: 1px solid #ddd;
            font-size: 10px;
        }
        
        .data-table td.center {
            text-align: center;
        }
        
        .data-table td.left {
            text-align: left;
        }
        
        .job-tag {
            display: inline-block;
            padding: 2px 6px;
            margin: 1px;
            font-size: 10px;
            font-weight: normal;
            color: #333;
            background: transparent;
            border: none;
        }   
        
        .total-row {
            background: #f0f2f7;
            font-weight: bold;
        }
        
        .total-row td {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">BÁO CÁO THỰC HIỆN SÁCH</div>
        <div class="subtitle">CHI TIẾT PHÂN CÔNG VÀ KHỐI LƯỢNG CÔNG VIỆC</div>
    </div>
    
    <div class="date-info">
        Ngày tạo báo cáo: {{ $generated_date }}
    </div>

    <div class="book-info">
        <table>
            <tr>
                <td class="label">Tên sách:</td>
                <td><strong>{{ $book->name }}</strong></td>
                <td class="label">Mã sách:</td>
                <td>{{ $book->bookCode ?? '—' }}</td>
            </tr>
            <tr>
                <td class="label">Số trang:</td>
                <td>{{ $book->page ?? '—' }} trang</td>
                <td class="label">Khổ giấy:</td>
                <td>{{ $book->paper->paperSize ?? '—' }}</td>
            </tr>
            <tr>
                <td class="label">Ngày tạo:</td>
                <td>{{ \Carbon\Carbon::parse($book->created_at)->format('d/m/Y') }}</td>
                <td class="label">Ngày hoàn thành:</td>
                <td>{{ \Carbon\Carbon::parse($book->end_time)->format('d/m/Y') }}</td>
            </tr>
        </table>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th width="30">STT</th>
                <th width="130">Tên nhân viên</th>
                <th width="100">Phòng ban</th>
                <th width="90">Chức vụ</th>
                <th width="70">Số trang HT</th>
                <th>Công việc</th>
            </tr>
        </thead>
        <tbody>
            @forelse($allocations as $index => $row)
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td class="left">{{ $row['employee_name'] ?? '—' }}</td>
                    <td class="center">{{ $row['department'] ?? '—' }}</td>
                    <td class="center">{{ $row['position'] ?? '—' }}</td>
                    <td class="center">{{ number_format($row['completed_page']) }}</td>
                    <td class="left">
                        @if(!empty($row['jobs']))
                            @foreach($row['jobs'] as $job)
                                <span class="job-tag">{{ $job }}</span>
                            @endforeach
                        @else
                            —
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="center">Không có dữ liệu</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="4" class="center"><strong>TỔNG CỘNG</strong></td>
                <td class="center"><strong>{{ number_format($total_pages) }}</strong></td>
                <td></td>
            </tr>
        </tfoot>
    </table>
</body>
</html>