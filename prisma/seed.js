// File: prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. CLEANUP (Hapus data lama)
  // PENTING: Hapus dari Child ke Parent untuk hindari error Foreign Key
  console.log('🧹 Cleaning up database...');
  await prisma.transactionDetail.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.item.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  // 2. CREATE USERS (Admin & Staff)
  console.log('👤 Creating users...');
  
  // Hash password (syarat wajib security)
  const salt = await bcrypt.genSalt(10);
  const passwordAdmin = await bcrypt.hash('admin123', salt);
  const passwordUser = await bcrypt.hash('user123', salt);

  // Buat 1 Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@inventory.com',
      password: passwordAdmin,
      role: 'ADMIN', // Ingat, kita pakai String sekarang
    },
  });

  // Buat 3 User Staff
  const staff1 = await prisma.user.create({
    data: { name: 'Staff Gudang 1', email: 'staff1@inventory.com', password: passwordUser, role: 'USER' },
  });
  const staff2 = await prisma.user.create({
    data: { name: 'Staff Gudang 2', email: 'staff2@inventory.com', password: passwordUser, role: 'USER' },
  });
  await prisma.user.create({
    data: { name: 'Staff Magang', email: 'magang@inventory.com', password: passwordUser, role: 'USER' },
  });

  // 3. CREATE SUPPLIERS (Min 5 data)
  console.log('🚚 Creating suppliers...');
  const suppliersData = [
    { name: 'PT Elektronik Jaya', contactInfo: '021-11111', address: 'Jakarta' },
    { name: 'CV Makmur Sentosa', contactInfo: '021-22222', address: 'Bandung' },
    { name: 'Toko Besi Kuat', contactInfo: '021-33333', address: 'Surabaya' },
    { name: 'Global Tech Import', contactInfo: '021-44444', address: 'Singapore' },
    { name: 'Local Woodworks', contactInfo: '021-55555', address: 'Yogyakarta' },
  ];

  // Gunakan loop untuk create agar kita bisa simpan ID-nya jika perlu (atau createMany)
  // createMany tidak mengembalikan item yang dibuat di SQLite, jadi kita loop manual
  // agar aman dan kompatibel.
  const suppliers = [];
  for (const s of suppliersData) {
    const created = await prisma.supplier.create({ data: s });
    suppliers.push(created);
  }

  // 4. CREATE ITEMS (Min 5 data)
  console.log('📦 Creating items...');
  const itemsData = [
    { name: 'Laptop Gaming', sku: 'LPT-001', quantity: 10, supplierId: suppliers[0].id },
    { name: 'Mouse Wireless', sku: 'ACC-001', quantity: 50, supplierId: suppliers[0].id },
    { name: 'Meja Kantor', sku: 'FUR-001', quantity: 5, supplierId: suppliers[1].id },
    { name: 'Kursi Ergonomis', sku: 'FUR-002', quantity: 12, supplierId: suppliers[1].id },
    { name: 'Monitor 24 Inch', sku: 'SCR-001', quantity: 8, supplierId: suppliers[3].id },
  ];

  const items = [];
  for (const i of itemsData) {
    const created = await prisma.item.create({ data: i });
    items.push(created);
  }

  // 5. CREATE TRANSACTIONS (Dummy history)
  console.log('📜 Creating transactions...');
  
  // Transaksi 1: Barang Masuk (IN) oleh Staff 1
  await prisma.transaction.create({
    data: {
      type: 'IN',
      userId: staff1.id,
      notes: 'Restock awal bulan',
      details: {
        create: [
          { itemId: items[0].id, quantity: 5, pricePerUnit: 15000000 },
          { itemId: items[1].id, quantity: 20, pricePerUnit: 150000 },
        ]
      }
    }
  });

  // Transaksi 2: Barang Keluar (OUT) oleh Staff 2
  await prisma.transaction.create({
    data: {
      type: 'OUT',
      userId: staff2.id,
      notes: 'Pengiriman ke klien A',
      details: {
        create: [
          { itemId: items[0].id, quantity: 1, pricePerUnit: 16000000 }, // Harga jual
        ]
      }
    }
  });

  console.log('✅ Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });