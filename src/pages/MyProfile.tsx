import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useProfile, useUpdateProfile, useUploadImage } from '../api/hooks';
import './AccountPages.css';

const MyProfile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
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

  // Load auth token
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
  }, []);

  // API hooks
  const { data: profileData, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useProfile(authToken);
  const updateProfileMutation = useUpdateProfile();
  const uploadImageMutation = useUploadImage();

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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !authToken) {
      if (!authToken) {
        alert('Please login first');
      }
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      console.log('🖼️ Uploading image:', file.name);
      await uploadImageMutation.mutateAsync({ file, authToken });
      alert('Profile image updated successfully!');
      // Refresh profile data to get updated image URL
      refetchProfile();
    } catch (error) {
      console.error('Upload image error:', error);
      alert('Failed to upload image');
    }
  };

  const handleUpdateProfile = async () => {
    if (!authToken) {
      alert('Please login first');
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
        data: payload,
        authToken
      });
      alert('Profile updated successfully!');
      // Refresh profile data to get updated information
      refetchProfile();
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Failed to update profile');
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
        title="My Profile"
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
          <h3>My Profile Information</h3>
          
          {profileLoading && (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <p>Loading profile data...</p>
            </div>
          )}
          
          {profileError && (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#dc3545' }}>
              <p>Error loading profile: {profileError.message}</p>
            </div>
          )}
          
          {!profileLoading && !profileError && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={formData.tname}
                  onChange={(e) => handleInputChange('tname', e.target.value)}
                  placeholder="Enter your full name" 
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.tphone1}
                  onChange={(e) => handleInputChange('tphone1', e.target.value)}
                  placeholder="+62 xxx-xxxx-xxxx" 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={formData.temail}
                  onChange={(e) => handleInputChange('temail', e.target.value)}
                  placeholder="your.email@example.com" 
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea 
                  value={formData.taddress}
                  onChange={(e) => handleInputChange('taddress', e.target.value)}
                  placeholder="Enter your complete address" 
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input 
                  type="text" 
                  value={formData.tzip}
                  onChange={(e) => handleInputChange('tzip', e.target.value)}
                  placeholder="Enter zip code" 
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <select 
                  value={formData.ccity}
                  onChange={(e) => handleInputChange('ccity', e.target.value)}
                >
                  <option value="">Select City</option>
                  <option value="Jakarta">Jakarta</option>
                  <option value="Surabaya">Surabaya</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Medan">Medan</option>
                  <option value="Semarang">Semarang</option>
                  <option value="Makassar">Makassar</option>
                  <option value="Palembang">Palembang</option>
                  <option value="Tangerang">Tangerang</option>
                  <option value="Depok">Depok</option>
                  <option value="Bekasi">Bekasi</option>
                  <option value="Bogor">Bogor</option>
                  <option value="Yogyakarta">Yogyakarta</option>
                  <option value="Malang">Malang</option>
                  <option value="Denpasar">Denpasar</option>
                  <option value="Balikpapan">Balikpapan</option>
                  <option value="Banjarmasin">Banjarmasin</option>
                  <option value="Samarinda">Samarinda</option>
                  <option value="Pontianak">Pontianak</option>
                  <option value="Pekanbaru">Pekanbaru</option>
                  <option value="Batam">Batam</option>
                  <option value="Padang">Padang</option>
                  <option value="Manado">Manado</option>
                  <option value="Jayapura">Jayapura</option>
                  <option value="Ambon">Ambon</option>
                  <option value="Kupang">Kupang</option>
                  <option value="Mataram">Mataram</option>
                  <option value="Banda Aceh">Banda Aceh</option>
                  <option value="Jambi">Jambi</option>
                  <option value="Bengkulu">Bengkulu</option>
                  <option value="Lampung">Lampung</option>
                  <option value="Serang">Serang</option>
                  <option value="Pangkal Pinang">Pangkal Pinang</option>
                  <option value="Tanjung Pinang">Tanjung Pinang</option>
                  <option value="Gorontalo">Gorontalo</option>
                  <option value="Mamuju">Mamuju</option>
                  <option value="Kendari">Kendari</option>
                  <option value="Palu">Palu</option>
                </select>
              </div>
              <div className="form-group">
                <label>Profession</label>
                <input 
                  type="text" 
                  value={formData.tprofession}
                  onChange={(e) => handleInputChange('tprofession', e.target.value)}
                  placeholder="Enter your profession" 
                />
              </div>
              <div className="form-group">
                <label>Organization</label>
                <input 
                  type="text" 
                  value={formData.torganization}
                  onChange={(e) => handleInputChange('torganization', e.target.value)}
                  placeholder="Enter your organization/company" 
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
                <label>Date of Birth</label>
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
                {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
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
