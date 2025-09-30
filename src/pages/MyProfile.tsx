import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useProfile, useUpdateProfile, useUploadImage, useCity } from '../api/hooks';
import { useAuthStore } from '../stores/authStore';
import './AccountPages.css';

const MyProfile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, token: authToken } = useAuthStore();
  const [formData, setFormData] = useState({
    tname: '',
    tphone1: '',
    temail: '',
    taddress: '',
    tzip: '',
    ccity: '',
    tprofession: '',
    torganization: '',
    tinstagram: '',
    tdob: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // API hooks
  const { data: profileData, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadImageMutation = useUploadImage();
  const { data: cityData, isLoading: cityLoading, error: cityError } = useCity();

  // Debug cityData structure
  useEffect(() => {
    if (cityData) {
      console.log('🏙️ City Data Structure:', cityData);
      console.log('🏙️ City Data Content Result:', cityData.content?.result);
      console.log('🏙️ Is Content.Result Array?', Array.isArray(cityData.content?.result));
      console.log('🏙️ Cities Count:', cityData.content?.result?.length);
    }
  }, [cityData]);

  // Populate form data when profile data is loaded
  useEffect(() => {
    if (profileData?.content?.result) {
      const profile = profileData.content.result;
      setFormData({
        tname: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        tphone1: profile.phone1 || '',
        temail: profile.email || '',
        taddress: profile.address || '',
        tzip: profile.zip || '',
        ccity: profile.city || '',
        tprofession: profile.profession || '',
        torganization: profile.organization || '',
        tinstagram: profile.instagram || '',
        tdob: profile.dob || ''
      });
    }
  }, [profileData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      temail: value
    }));

    // Validate email format if field is not empty
    if (value.trim() !== '' && !validateEmail(value)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Email Format',
        text: 'Please enter a valid email address (e.g., user@example.com)',
        confirmButtonColor: '#007bff',
        timer: 3000,
        timerProgressBar: true
      });
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !authToken) {
      if (!authToken) {
        Swal.fire({
          icon: 'warning',
          title: 'Authentication Required',
          text: 'Please login first',
          confirmButtonColor: '#007bff'
        });
      }
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please select a valid image file (JPEG, PNG, GIF)',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'File size must be less than 5MB',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    try {
      console.log('🖼️ Uploading image:', file.name);
      await uploadImageMutation.mutateAsync({ file, authToken });
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Profile image updated successfully!',
        confirmButtonColor: '#007bff'
      });
      // Refresh profile data to get updated image URL
      refetchProfile();
    } catch (error) {
      console.error('Upload image error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Failed to upload image',
        confirmButtonColor: '#007bff'
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!authToken) {
      Swal.fire({
        icon: 'warning',
        title: 'Authentication Required',
        text: 'Please login first',
        confirmButtonColor: '#007bff'
      });
      return;
    }

      // Validasi required fields
      if (!formData.tprofession.trim() ||
          !formData.torganization.trim() ||
          !formData.tinstagram.trim() ||
          !formData.taddress.trim() ||
          !formData.tdob.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Required Fields Missing',
          text: 'Field Profession, Organization, Instagram, Address, dan Date of Birth wajib diisi!',
          confirmButtonColor: '#007bff'
        });
        return;
      }

      // Validasi email format jika email diisi
      if (formData.temail.trim() !== '' && !validateEmail(formData.temail)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Email Format',
          text: 'Please enter a valid email address (e.g., user@example.com)',
          confirmButtonColor: '#007bff'
        });
        return;
      }

      try {
        // Prepare payload with current form data (allow empty values)
        const payload = {
          tprofession: formData.tprofession,
          torganization: formData.torganization,
          tinstagram: formData.tinstagram,
          taddress: formData.taddress,
          tzip: formData.tzip,
          temail: formData.temail,
          tdob: formData.tdob,
          ccity: formData.ccity
        };

        console.log('📤 Update Profile Payload:', payload);

        await updateProfileMutation.mutateAsync({
          data: payload
        });
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Profile updated successfully!',
          confirmButtonColor: '#007bff'
        });
        // Refresh profile data to get updated information
        refetchProfile();
      } catch (error) {
        console.error('Update profile error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Failed to update profile',
          confirmButtonColor: '#007bff'
        });
      }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    console.log('Cart clicked');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <div className="account-page">
      <AppbarDefault
        title="Profil Saya"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={0}
      />
      
      <div className="account-content">
        <div className="account-card">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '1rem' 
          }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img 
                src={
                  profileData?.content?.result?.image_url && 
                  profileData.content.result.image_url !== "http://mbapi.dswip.com/images/customer/"
                    ? profileData.content.result.image_url
                    : "/merci.png"
                }
                alt="Profile"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #ddd',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={handleImageClick}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/merci.png";
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0.8';
                  (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '1';
                  (e.target as HTMLImageElement).style.transform = 'scale(1)';
                }}
              />
              {uploadImageMutation.isPending && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  Uploading...
                </div>
              )}
              <div style={{
                position: 'absolute',
                bottom: '-5px',
                right: '-5px',
                background: '#007bff',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              onClick={handleImageClick}
              title="Change profile picture"
              >
                📷
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
          <h3>Informasi Profil Saya</h3>
          
          {profileLoading && (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <p>Memuat data profil...</p>
            </div>
          )}
          
          {profileError && (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#dc3545' }}>
              <p>Gagal memuat profil: {profileError.message}</p>
            </div>
          )}
          
          {!profileLoading && !profileError && (
            <>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input 
                  type="text" 
                  value={formData.tname}
                  onChange={(e) => handleInputChange('tname', e.target.value)}
                  placeholder="Masukkan nama lengkap Anda" 
                />
              </div>
              <div className="form-group">
                <label>No. HP</label>
                <input 
                  type="tel" 
                  value={formData.tphone1}
                  onChange={(e) => handleInputChange('tphone1', e.target.value)}
                  placeholder="Contoh: +62 xxx-xxxx-xxxx" 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={formData.temail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="email.anda@email.com" 
                />
              </div>
              <div className="form-group">
                <label>Alamat</label>
                <textarea 
                  value={formData.taddress}
                  onChange={(e) => handleInputChange('taddress', e.target.value)}
                  placeholder="Masukkan alamat lengkap Anda" 
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Kode Pos</label>
                <input 
                  type="text" 
                  value={formData.tzip}
                  onChange={(e) => handleInputChange('tzip', e.target.value)}
                  placeholder="Masukkan kode pos" 
                />
              </div>
              <div className="form-group">
                <label>Kota</label>
                <select 
                  value={formData.ccity}
                  onChange={(e) => handleInputChange('ccity', e.target.value)}
                  disabled={cityLoading}
                >
                  <option value="">
                    {cityLoading ? 'Memuat daftar kota...' : 'Pilih Kota'}
                  </option>
                  {cityError && (
                    <option value="" disabled>
                      Gagal memuat kota
                    </option>
                  )}
                  {cityData && (() => {
                    // Handle different possible data structures
                    let cities = [];
                    
                    if (Array.isArray(cityData)) {
                      cities = cityData;
                    } else if (cityData.content?.result && Array.isArray(cityData.content.result)) {
                      cities = cityData.content.result;
                    } else if (Array.isArray(cityData.content)) {
                      cities = cityData.content;
                    } else if (cityData.data && Array.isArray(cityData.data)) {
                      cities = cityData.data;
                    } else if (cityData.result && Array.isArray(cityData.result)) {
                      cities = cityData.result;
                    }

                    if (cities.length === 0) {
                      return (
                        <option value="" disabled>
                          Tidak ada kota tersedia
                        </option>
                      );
                    }

                    return cities.map((city: any, index: number) => {
                      // Handle different city object structures
                      const cityId = city.id || city.city_id || city.value || index;
                      const cityName = city.name || city.city_name || city.label || city.text || `Kota ${index + 1}`;
                      
                      return (
                        <option key={cityId} value={cityId}>
                          {cityName}
                        </option>
                      );
                    });
                  })()}
                </select>
              </div>
              <div className="form-group">
                <label>Profesi</label>
                <input 
                  type="text" 
                  value={formData.tprofession}
                  onChange={(e) => handleInputChange('tprofession', e.target.value)}
                  placeholder="Masukkan profesi Anda" 
                />
              </div>
              <div className="form-group">
                <label>Organisasi</label>
                <input 
                  type="text" 
                  value={formData.torganization}
                  onChange={(e) => handleInputChange('torganization', e.target.value)}
                  placeholder="Masukkan organisasi/perusahaan Anda" 
                />
              </div>
              <div className="form-group">
                <label>Instagram</label>
                <input 
                  type="text" 
                  value={formData.tinstagram}
                  onChange={(e) => handleInputChange('tinstagram', e.target.value)}
                  placeholder="@username" 
                />
              </div>
              <div className="form-group">
                <label>Tanggal Lahir</label>
                <input 
                  type="date" 
                  value={formData.tdob}
                  onChange={(e) => handleInputChange('tdob', e.target.value)}
                />
              </div>
              <button 
                className="save-btn"
                onClick={handleUpdateProfile}
              >
                {updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </>
          )}
        </div>
      </div>
      
      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default MyProfile;
