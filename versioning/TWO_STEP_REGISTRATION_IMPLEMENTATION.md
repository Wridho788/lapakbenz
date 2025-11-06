# Two-Step Registration Implementation

## Overview
Implementasi sistem registrasi dua tahap yang memisahkan pemilihan tipe pendaftaran dengan pengisian form, memberikan pengalaman yang lebih terarah dan user-friendly.

## Registration Flow

### Step 1: Registration Type Selection
User pertama kali dihadapkan pada pemilihan tipe pendaftaran dengan informasi lengkap:

1. **Member Komunitas** - Anggota resmi Mercedes-Benz Club
   - Akses ke semua event eksklusif
   - Fitur komunitas lengkap
   - Networking dengan sesama member
   - Merchandise club eksklusif

2. **Participant Umum** - Peserta umum untuk event
   - Akses ke event publik
   - Pendaftaran event mudah
   - Notifikasi event terbaru
   - Komunitas yang ramah

### Step 2: Contextual Form
Setelah memilih tipe, user diarahkan ke form yang disesuaikan dengan pilihan mereka.

## Implementation Details

### 1. State Management
```typescript
const [registrationType, setRegistrationType] = useState<'member' | 'participant' | ''>('');
const [showForm, setShowForm] = useState(false);
```

### 2. Navigation Functions
```typescript
const handleContinueToForm = () => {
  if (!registrationType) {
    toast.warning('Silakan pilih tipe pendaftaran terlebih dahulu');
    return;
  }
  setShowForm(true);
};

const handleBackToSelection = () => {
  setShowForm(false);
  // Reset form data when going back
  setFormData({
    chapter: registrationType === 'participant' ? '999' : '',
    fullName: '',
    // ... reset other fields
  });
};
```

### 3. Dynamic App Bar
```typescript
<AppbarAuth 
  title={!showForm ? "Pilih Tipe Pendaftaran" : `Daftar ${registrationType === 'member' ? 'Member' : 'Participant'}`} 
  onBack={showForm ? handleBackToSelection : handleBackClick} 
/>
```

## Step 1: Registration Type Selection Screen

### UI Components
```tsx
{!showForm ? (
  <>
    <h1 className="register-title">Daftar Sebagai Apa?</h1>
    <p className="register-subtitle">Pilih tipe pendaftaran yang sesuai dengan kebutuhan Anda</p>

    <div className="registration-type-container">
      <div className="registration-type-options">
        {/* Member Option */}
        <label className={`registration-type-option ${registrationType === 'member' ? 'selected' : ''}`}>
          <input type="radio" name="registrationType" value="member" />
          <div className="registration-type-content">
            <div className="registration-type-icon">👥</div>
            <div className="registration-type-text">
              <h4>Member Komunitas</h4>
              <p>Anggota resmi Mercedes-Benz Club dengan akses penuh</p>
              <ul className="registration-benefits">
                <li>✓ Akses ke semua event eksklusif</li>
                <li>✓ Fitur komunitas lengkap</li>
                <li>✓ Networking dengan sesama member</li>
                <li>✓ Merchandise club eksklusif</li>
              </ul>
            </div>
          </div>
        </label>

        {/* Participant Option */}
        <label className={`registration-type-option ${registrationType === 'participant' ? 'selected' : ''}`}>
          <input type="radio" name="registrationType" value="participant" />
          <div className="registration-type-content">
            <div className="registration-type-icon">👤</div>
            <div className="registration-type-text">
              <h4>Participant Umum</h4>
              <p>Peserta umum yang dapat mengikuti event-event terbuka</p>
              <ul className="registration-benefits">
                <li>✓ Akses ke event publik</li>
                <li>✓ Pendaftaran event mudah</li>
                <li>✓ Notifikasi event terbaru</li>
                <li>✓ Komunitas yang ramah</li>
              </ul>
            </div>
          </div>
        </label>
      </div>
    </div>

    <button
      type="button"
      className="continue-button"
      onClick={handleContinueToForm}
      disabled={!registrationType}
    >
      <span>
        {registrationType ? `Lanjut sebagai ${registrationType === 'member' ? 'Member' : 'Participant'}` : 'Pilih tipe pendaftaran'}
      </span>
      <span className="continue-arrow">→</span>
    </button>
  </>
) : (
  // Step 2: Registration Form
)}
```

### Features
- **Interactive Cards**: Visual feedback dengan hover effects dan selection indicators
- **Benefits List**: Detailed benefits untuk setiap tipe registrasi
- **Continue Button**: Dynamic text berdasarkan pilihan user
- **Validation**: Tidak bisa lanjut tanpa memilih tipe

## Step 2: Contextual Registration Form

### Dynamic Form Title
```tsx
<h1 className="register-title">
  {registrationType === 'member' ? 'Daftar Member Komunitas' : 'Daftar Participant Umum'}
</h1>
<p className="register-subtitle">
  {registrationType === 'member' 
    ? 'Lengkapi data untuk menjadi anggota resmi Mercedes-Benz Club' 
    : 'Lengkapi data untuk dapat mengikuti event-event kami'
  }
</p>
```

### Selected Type Badge
```tsx
<div className="selected-type-badge">
  <span className="badge-icon">
    {registrationType === 'member' ? '👥' : '👤'}
  </span>
  <span className="badge-text">
    {registrationType === 'member' ? 'Member Komunitas' : 'Participant Umum'}
  </span>
</div>
```

### Conditional Field Requirements

#### Chapter Selection
- **Member**: Chapter dropdown wajib dipilih
- **Participant**: Chapter hidden, otomatis set ke 999

#### Vehicle Information
```tsx
{registrationType === 'member' ? (
  <>
    {/* Vehicle Type - Required for Member */}
    <div className="form-group">
      <label htmlFor="vehicleType" className="form-label">
        Jenis Kendaraan Mercedes-Benz
      </label>
      <input
        placeholder="Contoh: W202, W124, W190, C-Class, E-Class"
        required
      />
      <small className="field-help">
        Masukkan tipe Mercedes-Benz yang Anda miliki
      </small>
    </div>
  </>
) : (
  <>
    {/* Vehicle Type - Optional for Participant */}
    <div className="form-group">
      <label htmlFor="vehicleType" className="form-label">
        Jenis Kendaraan <span className="optional-label">(Opsional)</span>
      </label>
      <input
        placeholder="Contoh: Toyota Avanza, Honda Jazz, dll"
      />
      <small className="field-help">
        Boleh kosong jika tidak memiliki kendaraan
      </small>
    </div>
  </>
)}
```

#### Field Requirements Summary
| Field | Member | Participant |
|-------|--------|-------------|
| Chapter | Required | Hidden (auto 999) |
| NIK | Required | Optional |
| Vehicle Type | Required (Mercedes) | Optional (Any) |
| Police Number | Required | Optional |

### Enhanced Validation
```typescript
// Member-specific validation
if (registrationType === 'member') {
  if (!formData.vehicleType) {
    toast.warning('Jenis kendaraan Mercedes-Benz wajib diisi untuk member');
    return;
  }
  if (!formData.policeNo) {
    toast.warning('Nomor polisi wajib diisi untuk member');
    return;
  }
  if (!formData.nik) {
    toast.warning('NIK wajib diisi untuk member');
    return;
  }
}
```

## CSS Styling

### Registration Benefits List
```css
.registration-benefits {
  list-style: none;
  padding: 0;
  margin: 12px 0 0 0;
}

.registration-benefits li {
  font-size: 12px;
  color: #555;
  margin: 4px 0;
  padding-left: 0;
}

.registration-type-option.selected .registration-benefits li {
  color: #1565c0;
}
```

### Continue Button
```css
.continue-button {
  width: 100%;
  padding: 16px 20px;
  background: linear-gradient(135deg, #161129, #2c5aa0);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'Lato', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
}

.continue-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(22, 17, 41, 0.3);
}

.continue-arrow {
  font-size: 18px;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.continue-button:hover:not(:disabled) .continue-arrow {
  transform: translateX(4px);
}
```

### Selected Type Badge
```css
.selected-type-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9ff, #e8f2ff);
  border: 2px solid #161129;
  border-radius: 12px;
  margin-bottom: 20px;
}

.badge-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #161129, #2c5aa0);
  color: white;
  border-radius: 10px;
  flex-shrink: 0;
}
```

### Optional Field Labels
```css
.optional-label {
  font-size: 12px;
  color: #28a745;
  font-weight: 500;
  background: #d4edda;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

.field-help {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-style: italic;
  line-height: 1.3;
}
```

## User Experience Benefits

### Step 1 Advantages
1. **Clear Decision Making**: User fokus pada satu keputusan penting dulu
2. **Informative**: Benefits list membantu user memahami perbedaan
3. **Visual Appeal**: Interactive cards dengan smooth animations
4. **Progressive Disclosure**: Tidak overwhelming dengan semua field sekaligus

### Step 2 Advantages
1. **Contextual Form**: Form disesuaikan dengan pilihan user
2. **Clear Purpose**: User tahu mereka sedang mendaftar sebagai apa
3. **Relevant Fields**: Hanya field yang relevan yang ditampilkan/required
4. **Back Navigation**: User bisa kembali mengubah pilihan jika perlu

### Mobile Responsiveness
```css
@media (max-width: 480px) {
  .continue-button {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .selected-type-badge {
    padding: 10px 12px;
    gap: 10px;
  }
  
  .registration-benefits li {
    font-size: 11px;
  }
}
```

## Business Logic Advantages

### For Member Registration
- **Comprehensive Data**: Collect complete Mercedes ownership info
- **Community Building**: Proper chapter assignment
- **Verification**: All required fields for membership validation

### For Participant Registration
- **Lower Barrier**: Easier sign-up process
- **Flexible Requirements**: Not everyone owns Mercedes
- **Event Focus**: Streamlined for event participation

### For System Management
- **Clean Data**: Proper categorization with chapter ID 999
- **Conditional Logic**: Different validation rules
- **Scalable**: Easy to add more registration types

## Future Enhancements

### Step 1 Enhancements
1. **Video Previews**: Show member vs participant app experience
2. **Testimonials**: Real member/participant feedback
3. **FAQ Section**: Common questions about each type
4. **Pricing Info**: If applicable, show membership fees

### Step 2 Enhancements
1. **Progress Indicator**: Show form completion progress
2. **Field Auto-completion**: Smart suggestions based on location
3. **Photo Upload**: Profile picture and vehicle photos
4. **Document Verification**: ID and vehicle document upload

### Analytics Opportunities
1. **Conversion Tracking**: Member vs participant selection rates
2. **Drop-off Analysis**: Where users abandon the flow
3. **Field Completion**: Which optional fields are most filled
4. **A/B Testing**: Different benefit presentations

## Technical Implementation Notes

- **State Persistence**: Form data retained when navigating back
- **Validation Context**: Different rules for different user types
- **Error Handling**: Contextual error messages
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Lazy loading of unnecessary resources
- **SEO**: Different meta tags for different registration paths

This implementation provides a much more guided and contextual registration experience, reducing cognitive load and improving conversion rates for both member and participant registrations.