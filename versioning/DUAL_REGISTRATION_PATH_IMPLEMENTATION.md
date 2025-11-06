# Dual Registration Path Implementation

## Overview
Implementasi sistem registrasi dengan dua jalur: Member Komunitas dan Participant Umum. Ini memungkinkan orang non-komunitas juga dapat login dan menggunakan aplikasi.

## Registration Flow

### Registration Types
1. **Member Komunitas** - Anggota resmi Mercedes-Benz Club
   - Harus pilih chapter/club
   - Mendapat akses penuh fitur komunitas
   - Chapter ID sesuai pilihan user

2. **Participant Umum** - Peserta umum untuk event
   - Tidak perlu pilih chapter (hidden)
   - Chapter ID otomatis = 999
   - Fokus pada partisipasi event

## Implementation Details

### 1. State Management
```typescript
const [registrationType, setRegistrationType] = useState<'member' | 'participant' | ''>('');
```

### 2. Registration Type Handler
```typescript
const handleRegistrationTypeChange = (type: 'member' | 'participant') => {
  setRegistrationType(type);
  // Reset chapter when switching to participant
  if (type === 'participant') {
    setFormData(prev => ({
      ...prev,
      chapter: '999' // Set chapter ID to 999 for non-member participants
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      chapter: '' // Reset chapter for member selection
    }));
  }
};
```

### 3. Dynamic Chapter Field
```typescript
// Chapter Dropdown - Only show for member
{registrationType === 'member' && (
  <div className="form-group">
    <label htmlFor="chapter" className="form-label">
      Chapter / Club
    </label>
    {/* Chapter select dropdown */}
  </div>
)}
```

### 4. API Data Preparation
```typescript
const registerData = {
  cchapter: registrationType === 'participant' ? '999' : formData.chapter,
  // ... other fields
};
```

### 5. Enhanced Validation
```typescript
// Validation
if (!registrationType) {
  toast.warning('Silakan pilih tipe pendaftaran (Member atau Participant)');
  return;
}

if (registrationType === 'member' && !formData.chapter) {
  toast.warning('Silakan pilih chapter untuk pendaftaran member');
  return;
}
```

## UI Components

### Registration Type Selection
```tsx
<div className="registration-type-container">
  <div className="registration-type-options">
    <label className={`registration-type-option ${registrationType === 'member' ? 'selected' : ''}`}>
      <input
        type="radio"
        name="registrationType"
        value="member"
        checked={registrationType === 'member'}
        onChange={() => handleRegistrationTypeChange('member')}
      />
      <div className="registration-type-content">
        <div className="registration-type-icon">👥</div>
        <div className="registration-type-text">
          <h4>Member Komunitas</h4>
          <p>Anggota resmi Mercedes-Benz Club</p>
        </div>
      </div>
    </label>

    <label className={`registration-type-option ${registrationType === 'participant' ? 'selected' : ''}`}>
      <input
        type="radio"
        name="registrationType" 
        value="participant"
        checked={registrationType === 'participant'}
        onChange={() => handleRegistrationTypeChange('participant')}
      />
      <div className="registration-type-content">
        <div className="registration-type-icon">👤</div>
        <div className="registration-type-text">
          <h4>Participant Umum</h4>
          <p>Peserta umum untuk mengikuti event</p>
        </div>
      </div>
    </label>
  </div>
</div>
```

### Participant Info Card
```tsx
{registrationType === 'participant' && (
  <div className="participant-info">
    <div className="info-card">
      <div className="info-icon">ℹ️</div>
      <div className="info-text">
        <p><strong>Participant Umum:</strong> Anda akan terdaftar sebagai peserta umum dan dapat mengikuti event-event yang dibuka untuk umum.</p>
      </div>
    </div>
  </div>
)}
```

### Dynamic Register Button
```tsx
<button
  type="submit"
  className="register-button dark-bg"
  onClick={handleRegister}
  disabled={isSubmitting || chaptersLoading || citiesLoading || !registrationType}
>
  <span style={{ color: '#fff' }}>
    {isSubmitting ? 'Sedang mendaftar...' : `Daftar sebagai ${registrationType === 'member' ? 'Member' : registrationType === 'participant' ? 'Participant' : 'Pilih Tipe'}`}
  </span>
  <MdPersonAdd className="register-icon" />
</button>
```

## CSS Styling

### Registration Type Cards
```css
.registration-type-option {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  position: relative;
  overflow: hidden;
}

.registration-type-option.selected {
  border-color: #161129;
  background: linear-gradient(135deg, #f8f9ff, #ffffff);
  box-shadow: 0 6px 20px rgba(22, 17, 41, 0.15);
  transform: translateY(-2px);
}

.registration-type-option.selected::after {
  content: '✓';
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #161129, #2c5aa0);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}
```

### Info Card Styling
```css
.info-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
  border-radius: 12px;
  border: 1px solid #bbdefb;
}
```

### Responsive Design
```css
@media (max-width: 480px) {
  .registration-type-content {
    gap: 12px;
  }
  
  .registration-type-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
  }
  
  .registration-type-text h4 {
    font-size: 14px;
  }
  
  .registration-type-text p {
    font-size: 12px;
  }
}
```

## User Experience Flow

### Step 1: Registration Type Selection
- User melihat dua pilihan: Member Komunitas vs Participant Umum
- Visual feedback dengan cards yang interactive
- Icons dan descriptions yang jelas

### Step 2: Conditional Chapter Selection
- **Member**: Chapter dropdown muncul, wajib dipilih
- **Participant**: Chapter dropdown hidden, chapter ID = 999

### Step 3: Form Completion
- Semua field lainnya sama untuk kedua tipe
- Validasi berbeda berdasarkan tipe registrasi

### Step 4: Registration Submission
- API data preparation berbeda berdasarkan tipe
- Button text dynamic berdasarkan pilihan
- Success message sesuai tipe registrasi

## Backend Integration

### API Payload Structure
```typescript
interface RegisterRequest {
  cchapter: string; // '999' for participant, selected chapter ID for member
  tname: string;
  tphone1: string;
  temail: string;
  taddress: string;
  tzip: string;
  ccity: string;
  tdob: string;
  tnik: string;
  tcartype: string;
  tpoliceno: string;
  tpassword: string;
}
```

### Chapter ID Logic
- **Member**: `cchapter` = selected chapter ID from dropdown
- **Participant**: `cchapter` = '999' (predefined ID for general participants)

## Benefits

### For Users
1. **Clear Path Selection** - Jelas membedakan member vs participant
2. **Simplified Flow** - Participant tidak perlu bingung pilih chapter
3. **Visual Feedback** - Interactive cards dengan checkmarks
4. **Responsive Design** - Works well on mobile devices

### For System
1. **Clean Data Structure** - Chapter ID 999 untuk participant
2. **Flexible Access Control** - Bisa kontrol akses berdasarkan chapter ID
3. **Backward Compatible** - Tidak mengubah API structure yang ada
4. **Scalable** - Mudah ditambah tipe registrasi lain

### For Business
1. **Broader User Base** - Non-member bisa participate
2. **Event Accessibility** - Lebih banyak peserta event
3. **Community Growth** - Path untuk convert participant jadi member
4. **Data Analytics** - Tracking member vs participant behavior

## Testing Scenarios

### Scenario 1: Member Registration
1. User pilih "Member Komunitas"
2. Chapter dropdown muncul
3. User pilih chapter
4. Submit dengan `cchapter` = selected chapter ID

### Scenario 2: Participant Registration
1. User pilih "Participant Umum"
2. Chapter dropdown hidden
3. Info card muncul
4. Submit dengan `cchapter` = '999'

### Scenario 3: Validation Testing
1. Submit tanpa pilih tipe → Error message
2. Member tanpa pilih chapter → Error message
3. Participant auto-fill chapter → Success

## Future Enhancements

### Phase 2 Features
1. **Member Upgrade Path** - Convert participant to member
2. **Chapter Recommendations** - Suggest chapter based on location
3. **Event Filtering** - Different events for member vs participant
4. **Badge System** - Visual distinction in profile

### Admin Features
1. **Registration Analytics** - Track member vs participant ratio
2. **Bulk Chapter Management** - Admin tools for chapter operations
3. **Approval Workflow** - Different approval process for each type
4. **Migration Tools** - Convert existing users to new system

## Migration Notes

- Existing registrations remain unchanged
- New dual-path only affects new registrations
- Chapter ID 999 reserved for participants
- No database schema changes required
- Backward compatible with existing auth system