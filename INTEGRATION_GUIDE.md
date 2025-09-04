# API Integration Guide

## Summary

Telah dibuat sistem API yang lengkap untuk aplikasi Merciku dengan fitur-fitur berikut:

### ✅ Fitur yang Sudah Dibuat

1. **API Client (`src/api/customerApi.ts`)**
   - Login pelanggan
   - Registrasi pelanggan 
   - Lupa password
   - Request OTP
   - Update profil
   - Ganti password

2. **React Query Hooks (`src/api/hooks.ts`)**
   - `useLogin()` - Hook untuk login
   - `useRegister()` - Hook untuk registrasi
   - `useForgotPassword()` - Hook untuk lupa password
   - `useRequestOTP()` - Hook untuk request OTP
   - `useUpdateProfile()` - Hook untuk update profil
   - `useChangePassword()` - Hook untuk ganti password

3. **Authentication Context (`src/contexts/AuthContext.tsx`)**
   - Provider untuk manajemen state autentikasi
   - Hook `useAuth()` untuk akses state autentikasi
   - HOC `withAuth()` untuk protected routes

4. **Komponen UI (`src/components/`)**
   - `LoginForm.tsx` - Form login dengan integrasi API
   - Contoh komponen yang siap pakai

5. **Contoh Penggunaan (`src/examples/`)**
   - `AuthExamples.tsx` - Contoh penggunaan untuk autentikasi
   - `ProfileExamples.tsx` - Contoh penggunaan untuk manajemen profil

### 🚀 Cara Penggunaan

#### 1. Setup di main.tsx
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
```

#### 2. Penggunaan di Komponen
```typescript
import { useLogin } from './api/hooks'
import { useAuth } from './contexts/AuthContext'

function LoginComponent() {
  const { login: setAuthUser } = useAuth()
  const loginMutation = useLogin()

  const handleLogin = async (formData) => {
    try {
      const result = await loginMutation.mutateAsync(formData)
      if (result.success) {
        setAuthUser({ token: result.token })
        // Navigate to dashboard
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      {/* Form fields */}
      <button disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Loading...' : 'Login'}
      </button>
    </form>
  )
}
```

#### 3. Protected Routes
```typescript
import { withAuth } from './contexts/AuthContext'

const ProtectedPage = withAuth(() => {
  return <div>This page requires authentication</div>
})
```

### 📁 Struktur File

```
src/
├── api/
│   ├── constants.ts        # API endpoints
│   ├── customerApi.ts      # API functions dan interfaces
│   ├── hooks.ts           # React Query hooks
│   └── index.ts           # Exports
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── components/
│   └── LoginForm.tsx      # Login form component
└── examples/
    ├── AuthExamples.tsx   # Contoh autentikasi
    └── ProfileExamples.tsx # Contoh manajemen profil
```

### 🔧 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/customer/auth` | Login |
| POST | `/customer/register` | Registrasi |
| POST | `/customer/forgot-password` | Lupa password |
| POST | `/customer/request-otp` | Request OTP |
| PUT | `/customer/profile` | Update profil |
| PUT | `/customer/change-password` | Ganti password |

### 📋 TypeScript Interfaces

Semua interface sudah didefinisikan dengan tipe yang tepat:
- `LoginRequest` / `LoginResponse`
- `RegisterRequest` / `RegisterResponse`
- `UpdateProfileRequest` / `UpdateProfileResponse`
- `ChangePasswordRequest` / `ChangePasswordResponse`
- Dan lainnya

### 🔐 Authentication Flow

1. User login menggunakan `useLogin()`
2. Token disimpan di localStorage
3. Token digunakan untuk request yang memerlukan autentikasi
4. AuthContext mengelola state autentikasi global
5. Protected routes menggunakan `withAuth()` HOC

### 🧪 Testing

Untuk testing API, buka file contoh:
- `src/examples/AuthExamples.tsx` - Test login, register, dll
- `src/examples/ProfileExamples.tsx` - Test update profil, ganti password

### 📚 Dokumentasi Lengkap

Lihat file `API_DOCUMENTATION.md` untuk dokumentasi lengkap yang mencakup:
- Penjelasan detail setiap endpoint
- Contoh error handling
- Best practices
- Security considerations

### 🔧 Konfigurasi Environment

Buat file `.env` untuk konfigurasi:
```env
VITE_API_BASE_URL=http://localhost:3001
```

### ⚡ Next Steps

1. **Integrasi ke halaman yang sudah ada**:
   - Ganti form login lama dengan `LoginForm` component
   - Tambahkan AuthProvider di main.tsx
   - Update routing untuk protected routes

2. **Error Handling**:
   - Tambahkan toast notifications untuk sukses/error
   - Implementasi retry logic untuk network errors

3. **Security**:
   - Pertimbangkan menggunakan httpOnly cookies
   - Implementasi token refresh

4. **Testing**:
   - Tambahkan unit tests untuk API functions
   - Integration tests untuk authentication flow

## 🎉 Kesimpulan

Sistem API sudah lengkap dan siap digunakan! File-file yang dibuat mencakup semua endpoint yang diminta dengan:

- ✅ Axios integration dengan TypeScript
- ✅ React Query untuk state management
- ✅ Authentication context untuk global state
- ✅ Form data conversion untuk API calls
- ✅ Error handling yang proper
- ✅ Loading states untuk UI
- ✅ Dokumentasi lengkap
- ✅ Contoh penggunaan yang komprehensif

Tinggal integrasikan ke halaman-halaman yang sudah ada!
