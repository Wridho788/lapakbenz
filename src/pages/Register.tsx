import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPersonAdd } from 'react-icons/md';
import { MdCalendarToday } from 'react-icons/md';
import { AppbarAuth } from '../components/AppbarAuth';
import { useRegister, useChapters, useCity } from '../api/hooks/index';
import { toast } from 'react-toastify';
import './Register.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    chapter: '',
    fullName: '',
    phone: '',
    email: '',
    address: '',
    zip: '',
    city: '',
    dob: '',
    nik: '',
    vehicleType: '',
    policeNo: '',
    password: '',
    confirmPassword: '',
    agree: '',
  });

  // Hooks for API calls
  const registerMutation = useRegister();
  const { data: chaptersData, isLoading: chaptersLoading, error: chaptersError } = useChapters();
  const { data: citiesData, isLoading: citiesLoading, error: citiesError } = useCity();

  // State for loading and error handling
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log(chaptersData,'chaptersData')

  useEffect(() => {
    if (chaptersError) {
      console.error('Error loading chapters:', chaptersError);
    }
    if (citiesError) {
      console.error('Error loading cities:', citiesError);
    }
  }, [chaptersError, citiesError]);


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    let fieldValue = value;
    if (type === 'checkbox') {
      fieldValue = (e.target as HTMLInputElement).checked ? 'true' : '';
    }
    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.agree !== 'true') {
      toast.warning('Please agree to the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for API according to RegisterRequest interface
      const registerData = {
        cchapter: formData.chapter,
        tname: formData.fullName,
        tphone1: formData.phone,
        temail: formData.email,
        taddress: formData.address,
        tzip: formData.zip,
        ccity: formData.city,
        tdob: formData.dob,
        tnik: formData.nik,
        tcartype: formData.vehicleType,
        tpoliceno: formData.policeNo,
        tpassword: formData.password,
      };

      console.log('Register attempt:', registerData);
      
      const result = await registerMutation.mutateAsync(registerData);
      console.log('Registration successful:', result);
      
      // Show success message with toast
      toast.success('Registration Successful! Your registration will be processed offline by admin.');
      navigate('/verify', { state: { username: registerData.tphone1,
            id_customer: result.content?.id // dari response register/request OTP
        } });
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Handle different types of errors
      let errorMessage = 'Registration failed. Please try again.';
      
      // Check if it's an Axios error with response
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        // Check for specific error format
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Show error message with toast
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate('/login');
  };

 

  return (
    <div className="register-page">
      <AppbarAuth title="Daftar" onBack={handleBackClick} />
      <div className="register-card">
        <h1 className="register-title">Daftar Sekarang!</h1>

        {/* The correct form starts below */}
        <form>
          {/* Chapter Dropdown */}
          <div className="form-group">
            <label htmlFor="chapter" className="form-label">
              Chapter
            </label>
            <select
              id="chapter"
              name="chapter"
              value={formData.chapter}
              onChange={handleInputChange}
              className="form-input"
              required
              disabled={chaptersLoading}
            >
              <option value="">
                {chaptersLoading ? 'Memuat chapter...' : 'Pilih Chapter'}
              </option>
              {chaptersData?.content?.result?.map((chapter: any) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.code} - {chapter.name}
                </option>
              )) || []}
              {/* Fallback options if API fails */}
              {chaptersError && !chaptersData && [
                <option key="MBW202.05" value="MBW202.05">MBW202.05 - MERCEDESBENZ W202 CHAPTER MEDAN</option>,
                <option key="MBCL" value="MBCL">MBCL - MERCEDES BENZ CLUB LAMPUNG</option>,
                <option key="MBCPKU" value="MBCPKU">MBCPKU - MERCEDES BENZ CLUB PEKAN BARU</option>
              ]}
            </select>
            {chaptersError && (
              <small style={{ color: 'red', fontSize: '12px' }}>
                Error loading chapters. Using fallback options.
              </small>
            )}
          </div>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Nama Lengkap
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Masukkan nama lengkap Anda"
              required
            />
          </div>
          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Nomor HP
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Masukkan nomor HP Anda"
              pattern="[0-9]+"
              required
            />
          </div>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Masukkan email Anda"
              required
            />
          </div>
          {/* Address */}
          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Alamat
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Masukkan alamat Anda"
              required
              rows={2}
            />
          </div>
          {/* Zip Code */}
          <div className="form-group">
            <label htmlFor="zip" className="form-label">
              Kode Pos
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Masukkan kode pos Anda"
              pattern="[0-9]+"
              required
            />
          </div>
          {/* City Dropdown */}
          <div className="form-group">
            <label htmlFor="city" className="form-label">
              Kota
            </label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="form-input"
              required
              disabled={citiesLoading}
            >
              <option value="">
                {citiesLoading ? 'Memuat kota...' : 'Pilih Kota'}
              </option>
              {citiesData?.content?.result?.map((city: any) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              )) || []}
              {/* Fallback options if API fails */}
              {citiesError && !citiesData && [
                <option key="aceh" value="aceh">Aceh</option>,
                <option key="medan" value="medan">Medan</option>,
                <option key="jakarta" value="jakarta">Jakarta</option>,
                <option key="bandung" value="bandung">Bandung</option>,
                <option key="surabaya" value="surabaya">Surabaya</option>
              ]}
            </select>
            {citiesError && (
              <small style={{ color: 'red', fontSize: '12px' }}>
                Error loading cities. Using fallback options.
              </small>
            )}
          </div>
          {/* DOB Date Picker */}
          <div className="form-group">
            <label htmlFor="dob" className="form-label">
              Tanggal Lahir
            </label>
            <div className="dob-picker-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="form-input dob-input"
                required
                style={{ paddingRight: 36 }}
              />
              <MdCalendarToday style={{ position: 'absolute', right: 12, color: '#888', pointerEvents: 'none', fontSize: 22 }} />
            </div>
          </div>
          {/* NIK */}
          <div className="form-group">
            <label htmlFor="nik" className="form-label">
              NIK
            </label>
            <input
              type="text"
              id="nik"
              name="nik"
              value={formData.nik}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Masukkan NIK Anda"
              pattern="[0-9]+"
              required
            />
          </div>
          {/* Vehicle Type */}
          <div className="form-group">
            <label htmlFor="vehicleType" className="form-label">
              Jenis Kendaraan
            </label>
            <input
              type="text"
              id="vehicleType"
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleInputChange}
              className="form-input"
              placeholder="W202 - W124 - W190"
              required
            />
          </div>
          {/* Police No */}
          <div className="form-group">
            <label htmlFor="policeNo" className="form-label">
              Nomor Polisi
            </label>
            <input
              type="text"
              id="policeNo"
              name="policeNo"
              value={formData.policeNo}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Masukkan nomor polisi Anda"
              required
            />
          </div>
          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Kata Sandi
            </label>
            <input
              type="text"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input password-input"
              placeholder="Masukkan kata sandi Anda"
              required
            />
          </div>
          {/* Password Again */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Ulangi Kata Sandi
            </label>
            <input
              type="text"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="form-input password-input"
              placeholder="Ulangi kata sandi Anda"
              required
            />
          </div>
          {/* Terms & Conditions Radio */}
          <div className="form-group terms-group">
            <div className="terms-container">
              <label htmlFor="agree" className="terms-label">
                <input
                  type="radio"
                  id="agree"
                  name="agree"
                  value="true"
                  checked={formData.agree === 'true'}
                  onChange={handleInputChange}
                  className="terms-radio"
                  required
                />
                <span className="radio-custom">
                  <span className="radio-dot"></span>
                </span>
                <span className="terms-text">
                  Saya setuju dengan <span className="terms-link">syarat dan ketentuan</span>
                </span>
              </label>
            </div>
          </div>
          {/* Register Button */}
            <button
            type="submit"
            className="register-button dark-bg"
            onClick={handleRegister}
            disabled={isSubmitting || chaptersLoading || citiesLoading}
            >
            <span style={{ color: '#fff' }}>
              {isSubmitting ? 'Sedang mendaftar...' : 'Daftar'}
            </span>
            <MdPersonAdd className="register-icon" />
            </button>
        </form>
      </div>
    </div>
    // </div>
  );
};

export default Register;