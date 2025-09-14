# Notification System Demo

## 🔔 Fitur yang Tersedia:

### 1. **Notification Badge di AppbarHomepage**
- Menampilkan jumlah notifikasi yang belum dibaca
- Badge merah dengan angka (0-99, atau 99+ jika >99)
- Animasi bounce saat badge muncul
- Click untuk navigate ke halaman notifications

### 2. **Halaman Notifications** (`/notifications`)
- List semua notifications dengan dummy data (5 items)
- **3 Kolom Layout:**
  - **Kolom 1**: Icon message dengan background warna:
    - 🔴 **Merah**: Belum dibaca (unread)
    - 🟢 **Hijau**: Sudah dibaca (read)
  - **Kolom 2**: Title + DateTime (DD/MM/YYYY - HH:MM:SS)
  - **Kolom 3**: Arrow ke kanan (→)

### 3. **Interactive Features**
- **Click notification item** → SweetAlert popup dengan message
- **Auto mark as read** saat notification diklik
- **Close SweetAlert** → kembali ke halaman notifications
- **Back button** untuk kembali ke halaman sebelumnya

### 4. **Demo Controls di Dashboard**
- **"Add Test Notification"** - Menambah notifikasi baru
- **"Check Count"** - Melihat jumlah unread notifications

---

## 🧪 Testing Instructions:

### Test 1: Notification Badge
1. Buka dashboard (`/`)
2. Lihat badge di notification icon (top right)
3. Angka badge = jumlah unread notifications

### Test 2: Add Notification
1. Di dashboard, click "Add Test Notification"
2. Badge count akan bertambah
3. Notification baru muncul di halaman notifications

### Test 3: View Notifications
1. Click notification icon di AppbarHomepage
2. Navigate ke `/notifications`
3. Lihat list 5 dummy notifications + test notifications

### Test 4: Read Notification
1. Di halaman notifications, click salah satu item (merah = unread)
2. SweetAlert popup muncul dengan message
3. Click "Close" untuk tutup popup
4. Icon notification berubah hijau (sudah dibaca)
5. Badge count di AppbarHomepage berkurang

### Test 5: Navigation
1. Click back button (←) di notifications page
2. Kembali ke halaman sebelumnya
3. Badge count tetap update sesuai unread notifications

---

## 📱 Responsive Design:

- **Mobile (<430px)**: Full width, compact layout
- **Tablet (430px-690px)**: Centered layout
- **Desktop (>690px)**: Full width with proper spacing

---

## 🎨 Visual Features:

- **Gradient backgrounds** untuk headers
- **Glass morphism effects** dengan backdrop-filter
- **Smooth animations** untuk hover dan transitions
- **Color coding** untuk read/unread status
- **Typography hierarchy** dengan proper spacing
- **Accessibility** dengan ARIA labels dan keyboard navigation

---

## 🔧 Technical Implementation:

- **React Context** untuk global notification state
- **SweetAlert2** untuk popup notifications
- **React Router** untuk navigation
- **TypeScript** untuk type safety
- **CSS Modules** untuk styling
- **Mobile-first** responsive design

---

## 📋 Dummy Data:

1. **Welcome to Merciku App!** (unread)
2. **Update Profil Anda** (read)
3. **Event Spesial Minggu Ini** (unread)
4. **Poin Anda Bertambah!** (read)
5. **Maintenance Terjadwal** (unread)

---

## 🚀 Ready to Test!

1. `pnpm run dev`
2. Open http://localhost:5173/
3. Follow testing instructions above
4. Enjoy the notification system! 🎉
