<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { font-family: DejaVu Sans; font-size: 11px; }
table { width: 100%; border-collapse: collapse; }
thead { display: table-header-group; }
tr { page-break-inside: avoid; }
table, th, td { border: 1px solid black; }
th, td { padding: 4px; text-align: center; }
.title { text-align: center; font-weight: bold; font-size: 14px; margin-bottom: 10px; }
.subtitle { text-align: right; font-size: 14px; margin-bottom: 15px; }
.total-row td { font-weight: bold; background-color: #f0f0f0; }
.footer { text-align: right; margin-top: 10px; font-style: italic; font-size: 10px; }
</style>
</head>
<body>

<div class="title">BẢNG CHI TIẾT KHỐI LƯỢNG CÔNG VIỆC BIÊN TẬP</div>
<div class="subtitle">Phòng ban: {{ $department_name ?? 'Tất cả' }}</div>

<table>
    <thead>
        <tr>
            <th rowspan="2">TT</th>
            <th rowspan="2">Tên sách</th>
            <th rowspan="2">Số trang</th>
            <th rowspan="2">Khổ sách</th>
            <th rowspan="2">Loại sách</th>
            <th rowspan="2">XB</th>
            <th rowspan="2">HS khổ</th>
            <th rowspan="2">Số trang quy đổi</th>
            <th colspan="3">HS</th>
            <th colspan="3">Số trang thực hiện</th>
            <th rowspan="2">Trang qđ</th>
            <th rowspan="2">Phòng ban</th>
            <th rowspan="2">Số tiền</th>
            <th rowspan="2">Người TH</th>
        </tr>
        <tr>
            <th>BT</th><th>ĐC</th><th>SB</th>
            <th>Đọc ĐC</th><th>Sửa bài</th><th>BT</th>
        </tr>
    </thead>
    <tbody>
        @forelse($rows as $row)
        <tr>
            <td>{{ $row['index'] }}</td>
            <td style="text-align:left">{{ $row['book_name'] }}</td>
            <td>{{ $row['completed_page'] }}</td>
            <td>{{ $row['paper_size'] }}</td>
            <td>{{ $row['type'] }}</td>
            <td>{{ $row['publishing'] }}</td>
            <td>{{ $row['paper_coefficient'] }}</td>
            <td>{{ $row['conversion_page'] }}</td>
            <td>{{ $row['editing_coefficient'] }}</td>
            <td>{{ $row['proofreading_coefficient'] }}</td>
            <td>{{ $row['correction_coefficient'] }}</td>
            <td>{{ $row['proofreading_page'] }}</td>
            <td>{{ $row['correction_page'] }}</td>
            <td>{{ $row['editing_page'] }}</td>
            <td>{{ $row['decision_page'] }}</td>
            <td>{{ $row['department'] }}</td>
            <td>{{ number_format($row['salary'], 0, ',', '.') }}</td>
            <td>{{ $row['employee_name'] }}</td>
        </tr>
        @empty
        <tr><td colspan="18">Không có dữ liệu</td></tr>
        @endforelse
    </tbody>
    <tfoot>
        <tr class="total-row">
            <td colspan="16" style="text-align:right">Tổng cộng:</td>
            <td>{{ number_format($total_salary, 0, ',', '.') }}</td>
            <td></td>
        </tr>
    </tfoot>
</table>

<div class="footer">Xuất lúc: {{ $generated_at }}</div>
</body>
</html>