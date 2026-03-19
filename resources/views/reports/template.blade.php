<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>

body{
    font-family: DejaVu Sans;
    font-size:12px;
}

table{
    width:100%;
    border-collapse: collapse;
}

thead {
    display: table-header-group;
}

tr {
    page-break-inside: avoid;
}

table, th, td{
    border:1px solid black;
}

th, td{
    padding:5px;
    text-align:center;
}

.title{
    text-align:center;
    font-weight:bold;
    font-size:16px;
    margin-bottom:10px;
}

</style>
</head>

<body>

<div class="title">
BẢNG CHI TIẾT KHỐI LƯỢNG CÔNG VIỆC BIÊN TẬP <br>
QUYẾT TOÁN NĂNG SUẤT ...
</div>
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
<th>BT</th>
<th>ĐC</th>
<th>SB</th>

<th>Đọc ĐC</th>
<th>Sửa bài</th>
<th>BT</th>
</tr>

</thead>

<tbody>

@for($i=0;$i<10;$i++)
<tr>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
@endfor

</tbody>

</table>

</body>
</html>