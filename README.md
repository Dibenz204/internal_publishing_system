# Hệ Thống Quản Lý Công Việc Nội Bộ Nhà Xuất Bản

> **Internal Publishing Workflow Management System**  
> Dự án thực tập tốt nghiệp – Trường Đại học Sài Gòn  
> Sinh viên: **Nguyễn Đình Phong** (MSSV: 3122480044)  
> Đơn vị thực tập: **Công ty Cổ phần DVXB Giáo dục Gia Định (GIAEP JSC)**

---

## Mục Lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt & Chạy dự án](#cài-đặt--chạy-dự-án)
- [Cấu trúc cơ sở dữ liệu](#cấu-trúc-cơ-sở-dữ-liệu)
- [Phân quyền người dùng](#phân-quyền-người-dùng)
- [Các module chính](#các-module-chính)

---

## Giới thiệu

Nhà Xuất Bản Giáo dục Gia Định xử lý hàng trăm đầu sách mỗi năm, mỗi cuốn phải trải qua nhiều công đoạn: lên ý tưởng → phê duyệt → biên tập → đính chính → kiểm duyệt → in ấn → phát hành. Trước đây, toàn bộ quy trình này được quản lý thủ công qua Excel và giấy tờ, dẫn đến:

- Khó theo dõi tiến độ tổng thể
- Dễ bỏ sót công việc, phân công trùng lặp
- Phụ thuộc nhiều vào Thư ký biên tập (TKBT) làm trung gian

Hệ thống này được xây dựng để **số hóa và tối ưu hóa** toàn bộ quy trình trên, giúp các phòng ban phối hợp rõ ràng, minh bạch và hiệu quả hơn.

---

## Tính Năng

### Quản lý người dùng & phân quyền
- Tạo tài khoản tự động (username = họ tên + ngày sinh) khi thêm nhân viên
- Phân quyền theo chức vụ (RBAC): Admin, TKBT, Trưởng phòng, Nhân viên, HR, Kế toán
- Xác thực bằng session + CSRF, mật khẩu mã hóa hash

### Quản lý sách (đầu sách)
- Thêm, cập nhật, ngừng phát hành đầu sách
- Theo dõi song song **trang ước tính** và **trang thực tế**
- Phân loại theo danh mục, khổ giấy
- Phân công phòng ban tham gia từng đầu sách

### Theo dõi vận hành (BookTransfer)
- Lịch sử luân chuyển sách qua các phòng ban theo mốc thời gian
- Thống kê số lần xử lý theo từng phòng
- Trực quan hóa phòng ban đang xử lý hiện tại

### Quản lý phân công (Allocation)
- Trưởng phòng phân công nhân viên với công việc cụ thể (Biên tập, Đính chính, Sửa bài,...)
- Hệ số công việc được lấy động từ bảng cấu hình
- Theo dõi tiến độ số trang từng nhân viên
- Nhân viên tự cập nhật trạng thái hoàn thành / mở lại tiến độ

### Báo cáo
- Tổng hợp theo phòng ban hoặc từng nhân viên cụ thể
- Lọc theo tháng/năm
- Xuất file **PDF** để lưu hành nội bộ

### Nhật ký hoạt động (Audit Log)
- Ghi nhận tự động toàn bộ hành động: đăng nhập, tạo, cập nhật, phân công,...
- Lưu IP, URL, dữ liệu cũ/mới (old_data / new_data) theo JSON
- Không cho phép sửa/xóa log, chỉ Admin truy cập
- Bộ lọc theo nhân viên, module, hành động, khoảng thời gian

### Quản lý thông số
- Hệ số công việc (Biên tập, Đính chính, Sửa bài,...)
- Hệ số khổ giấy (a4, 17x24, 19x26.5,...)
- Hệ số lương theo năm (lưu lịch sử, không ảnh hưởng năm cũ)
- Chức vụ, danh mục sách

---

## Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│            React + Vite (SPA)                    │
│    Giao diện phân theo từng vai trò người dùng   │
└──────────────────────┬──────────────────────────┘
                       │ HTTP / REST API
┌──────────────────────▼──────────────────────────┐
│                   Backend                        │
│              Laravel (PHP) – MVC                 │
│  Route → Middleware (Auth/CSRF) → Controller     │
│              → Model (Eloquent ORM)              │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                  Database                        │
│                   MySQL                          │
│        Quản lý migration theo phiên bản          │
└─────────────────────────────────────────────────┘
```

Hệ thống triển khai trên **XAMPP (localhost)** trong giai đoạn phát triển, và **server nội bộ** của Nhà Xuất Bản khi production.

---

## Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|---|---|
| Backend | PHP / Laravel |
| Frontend | React + Vite |
| Database | MySQL |
| Authentication | Session + CSRF |
| API | RESTful (GET, POST, PUT, PATCH) |
| Dev environment | XAMPP (localhost) |
| Version control | Git / GitHub |

---

## Cài Đặt & Chạy Dự Án

### Yêu cầu
- PHP >= 8.1
- Composer
- Node.js >= 18
- MySQL
- XAMPP (hoặc bất kỳ web server tương đương)

### 1. Clone repository

```bash
git clone https://github.com/Dibenz204/internal_publishing_system.git
cd internal_publishing_system
```

### 2. Cài đặt Backend (Laravel)

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Cấu hình file `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=internal_publishing
DB_USERNAME=root
DB_PASSWORD=
```

Chạy migration và seed dữ liệu mẫu:

```bash
php artisan migrate
php artisan db:seed
```

### 3. Cài đặt Frontend (React + Vite)

```bash
npm install
```

### 4. Chạy dự án

Chạy đồng thời Backend và Frontend:

```bash
# Terminal 1 – Backend
php artisan serve

# Terminal 2 – Frontend
npm run dev
```

Truy cập: `http://localhost:5173`

---

## Cấu Trúc Cơ Sở Dữ Liệu

Các bảng chính trong hệ thống:

| Bảng | Mô tả |
|---|---|
| `employees` | Thông tin nhân viên |
| `users` | Tài khoản đăng nhập (1-1 với employee) |
| `positions` | Chức vụ (Trưởng phòng, TKBT, Nhân viên,...) |
| `departments` | Phòng ban |
| `books` | Thông tin đầu sách |
| `book_categories` | Danh mục sách |
| `book_book_category` | Bảng trung gian (sách – danh mục) |
| `papers` | Khổ giấy và hệ số quy đổi |
| `projects` | Dự án (sách × phòng ban) |
| `book_transfers` | Lịch sử luân chuyển sách giữa các phòng |
| `allocations` | Phân công nhân viên trong từng dự án |
| `job_categories` | Loại công việc và hệ số (Biên tập, Đính chính,...) |
| `salary_coefficients` | Hệ số lương theo năm |
| `reports` | Báo cáo tổng hợp |

---

## Phân Quyền Người Dùng

| Chức vụ | Quyền hạn chính |
|---|---|
| **Admin** | Quản trị toàn hệ thống, xem Audit Log, quản lý thông số |
| **Thư ký biên tập (TKBT)** | Thêm/quản lý sách, phân công phòng ban, phê duyệt chuyển giao, xác nhận hoàn thành |
| **Trưởng phòng** | Nhận/từ chối dự án, phân công nhân viên, gửi kết quả lên TKBT |
| **Nhân viên** | Xem công việc được giao, cập nhật số trang, đánh dấu hoàn thành |
| **HR** | Thêm/cập nhật thông tin nhân viên |
| **Kế toán** | Xem và xuất báo cáo lương theo phòng ban/cá nhân |

---

## Các Module Chính

```
internal_publishing_system/
├── Backend (Laravel)
│   ├── Auth              – Đăng nhập / đăng xuất (session + CSRF)
│   ├── Employee          – Quản lý nhân sự
│   ├── Department        – Quản lý phòng ban
│   ├── Position          – Quản lý chức vụ
│   ├── Book              – Quản lý đầu sách
│   ├── BookCategory      – Danh mục sách
│   ├── Paper             – Khổ giấy & hệ số
│   ├── Project           – Dự án (sách × phòng)
│   ├── BookTransfer      – Luân chuyển sách
│   ├── Allocation        – Phân công công việc
│   ├── JobCategory       – Loại hình công việc
│   ├── SalaryCoefficient – Hệ số lương theo năm
│   ├── Report            – Báo cáo & xuất PDF
│   └── AuditLog          – Nhật ký hệ thống
│
└── Frontend (React + Vite)
    ├── /login            – Đăng nhập
    ├── /profile          – Hồ sơ cá nhân
    ├── /books            – Quản lý sách (TKBT)
    ├── /books/:id/track  – Theo dõi vận hành
    ├── /employees        – Quản lý nhân sự (HR)
    ├── /settings         – Thông số hệ thống (Admin)
    ├── /projects         – Công việc phòng (Trưởng phòng)
    ├── /my-tasks         – Công việc cá nhân (Nhân viên)
    ├── /reports          – Báo cáo
    └── /audit-logs       – Nhật ký hoạt động (Admin)
```

---

## Chiến Lược Phân Nhánh (Git)

Dự án sử dụng **feature branching**: mỗi tính năng được phát triển trên nhánh riêng, sau đó merge vào `main` qua Pull Request.

Một số nhánh tiêu biểu:

| Nhánh | Mô tả |
|---|---|
| `main` | Nhánh chính, phiên bản ổn định |
| `Autentication_Authorization` | Xác thực & phân quyền |
| `Lam-book_bookcategory` | Module sách & danh mục |
| `Lam-project` | Module dự án |
| `Lam-Allocation` | Module phân công |
| `yen-report-service` | API báo cáo |
| `yen-migrationnn` | Migration cơ sở dữ liệu |
| `Frontend` | Giao diện React |
| `feature/deploy` | Cấu hình triển khai |

---

## Tác Giả

- **Nguyễn Đình Phong** – Trưởng nhóm, Backend & Database design  
  MSSV: 3122480044 | Lớp: DTU1221  
  Trường Đại học Sài Gòn – Khoa Toán – Ứng dụng

**Giảng viên hướng dẫn:** PGS.TS. Lê Minh Triết  
**Đơn vị thực tập:** Công ty Cổ phần DVXB Giáo dục Gia Định  
**Địa chỉ:** 231 Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh

---

*Dự án hoàn thành tháng 3/2026 – Báo cáo thực tập tốt nghiệp*
