# ☁️ Deployment Guide - Inventory API

Dokumen ini berisi panduan lengkap untuk men-deploy aplikasi Inventory API ke layanan **AWS EC2 (Ubuntu 22.04)**.

---

## 1. Persiapan AWS EC2

### A. Launch Instance
1.  Login ke **AWS Academy Learner Lab**.
2.  Masuk ke **AWS Console** -> **EC2**.
3.  Klik **Launch Instance**.
4.  **Name:** `InventoryServer`
5.  **OS Image:** Ubuntu Server 22.04 LTS (HVM).
6.  **Instance Type:** t2.micro (Free Tier).
7.  **Key Pair:** Buat baru (`vockey.pem`) atau gunakan yang sudah ada. **Simpan file .pem ini!**

### B. Konfigurasi Security Group (Firewall)
Pastikan untuk menambahkan aturan berikut di **Inbound Rules**:

| Type | Protocol | Port | Source | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| **SSH** | TCP | `22` | 0.0.0.0/0 | Akses Terminal Remote |
| **HTTP** | TCP | `80` | 0.0.0.0/0 | Akses Web Public |
| **Custom TCP** | TCP | `3000` | 0.0.0.0/0 | Akses API Direct (Testing) |

---

## 2. Setup Server Environment

Login ke server menggunakan terminal (Git Bash / CMD):
```bash
ssh -i "kunci-anda.pem" ubuntu@<PUBLIC_IP_AWS>

A. Update & Install Node.js (v18)

    # 1. Update package list
    sudo apt update

    # 2. Install curl
    sudo apt install curl -y

    # 3. Setup Node.js v18 Repository
    curl -fsSL [https://deb.nodesource.com/setup_18.x](https://deb.nodesource.com/setup_18.x) | sudo -E bash -

    # 4. Install Node.js & Git
    sudo apt install -y nodejs git

    # 5. Verifikasi instalasi
    node -v  
    npm -v

B. Install PM2 (Process Manager)

Agar aplikasi tetap jalan walau terminal ditutup.

sudo npm install -g pm2

3. Setup Aplikasi

A. Clone Repository

# 1. Clone dari GitHub
git clone [https://github.com/Irfan1401/InventoryStorageProject_D121231093.git](https://github.com/Irfan1401/InventoryStorageProject_D121231093.git)

# 2. Masuk ke folder project
cd inventory-api

# 3. Install dependencies
npm install

B. Konfigurasi Environment Variable (.env)

Buat file .env baru untuk production: nano .env


Isi dengan konfigurasi berikut:

    NODE_ENV=production
    PORT=3000

    # Database Production (SQLite file akan dibuat otomatis)
    DATABASE_URL="file:./prod.db"

    # JWT Secrets (Gunakan string acak yang panjang & aman)
    JWT_SECRET="rahasia_production_yang_sangat_panjang_dan_aman_123"
    JWT_EXPIRES_IN="1h"

    JWT_REFRESH_SECRET="rahasia_refresh_production_456"
    JWT_REFRESH_EXPIRES_IN="7d"


Tekan Ctrl + X, lalu Y, lalu Enter untuk menyimpan.

C. Setup Database (Prisma)

    # 1. Generate Prisma Client
    npx prisma generate

    # 2. Deploy Migration (Membuat tabel di prod.db)
    npx prisma migrate deploy

    # 3. Seeding Data Awal (Admin & User Dummy)
    npx prisma db seed

4. Menjalankan Aplikasi (Start)

Gunakan PM2 untuk menjalankan server di background.

    # 1. Start Aplikasi
    pm2 start src/app.js --name "inventory-api"

    # 2. Simpan list proses agar auto-start saat reboot
    pm2 save
    pm2 startup


Sekarang API bisa diakses langsung di: http://3.239.13.113

🛠 Troubleshooting

1. Error "Permission denied (publickey)" saat SSH:

    - Pastikan file .pem sudah benar.

    - Di Windows: Gunakan Properties -> Security -> Remove inheritance (hanya user Anda yang boleh akses).

    - Di Linux/Mac: chmod 400 kunci-anda.pem.

2. Website tidak bisa diakses (Loading terus):

    - Cek Security Group di AWS Console. Pastikan Port 80 (HTTP) dan 3000 (Custom TCP) sudah dibuka untuk 0.0.0.0/0.

3. Aplikasi Error / Crash:

    - Cek log error dengan perintah: pm2 logs inventory-api.