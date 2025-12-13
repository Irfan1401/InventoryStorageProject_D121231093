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
Pastikan Anda menambahkan aturan berikut di **Inbound Rules**:

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
node -v  # Harusnya v18.x.x
npm -v