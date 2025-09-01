import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPersonAdd } from 'react-icons/md';
import { AppbarAuth } from '../components/AppbarAuth';
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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register attempt:', formData);
    // TODO: Implement register logic
    // For now, navigate to login
    navigate('/login');
  };

  const handleBackClick = () => {
    navigate('/login');
  };

 

  return (
    <div className="register-page">
      <AppbarAuth title="Register" onBack={handleBackClick} />
      <div className="register-card">
        <h1 className="register-title">Register Now!</h1>

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
            >
              <option value="">Select Chapter</option>
              <option value="MBW202.05">MBW202.05 - MERCEDESBENZ W202 CHAPTER MEDAN</option>
              <option value="MBCL">MBCL - MERCEDES BENZ CLUB LAMPUNG</option>
              <option value="MBCPKU">MBCPKU - MERCEDES BENZ CLUB PEKAN BARU</option>
            </select>
          </div>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your full name"
              required
            />
          </div>
          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your phone number"
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
              placeholder="Enter your email"
              required
            />
          </div>
          {/* Address */}
          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your address"
              required
              rows={2}
            />
          </div>
          {/* Zip Code */}
          <div className="form-group">
            <label htmlFor="zip" className="form-label">
              Zip Code
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your zip code"
              pattern="[0-9]+"
              required
            />
          </div>
          {/* City Dropdown */}
          <div className="form-group">
            <label htmlFor="city" className="form-label">
              City
            </label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Select City</option>
              <option value="aceh">Aceh</option>
              <option value="medan">Medan</option>
              <option value="jakarta">Jakarta</option>
              <option value="bandung">Bandung</option>
              <option value="surabaya">Surabaya</option>
            </select>
          </div>
          {/* DOB Date Picker */}
          <div className="form-group">
            <label htmlFor="dob" className="form-label">
              Date of Birth
            </label>
            <div className="dob-picker-container">
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="form-input dob-input"
                required
              />
             
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
              placeholder="Enter your NIK"
              pattern="[0-9]+"
              required
            />
          </div>
          {/* Vehicle Type */}
          <div className="form-group">
            <label htmlFor="vehicleType" className="form-label">
              Vehicle Type
            </label>
            <input
              type="text"
              id="vehicleType"
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your vehicle type"
              required
            />
          </div>
          {/* Police No */}
          <div className="form-group">
            <label htmlFor="policeNo" className="form-label">
              Police No
            </label>
            <input
              type="text"
              id="policeNo"
              name="policeNo"
              value={formData.policeNo}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your police number"
              required
            />
          </div>
          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="text"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input password-input"
              placeholder="Enter your password"
              required
            />
          </div>
          {/* Password Again */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Password Again
            </label>
            <input
              type="text"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="form-input password-input"
              placeholder="Confirm your password"
              required
            />
          </div>
          {/* Terms & Conditions Radio */}
          <div className="form-group terms-group">
            <label className="form-label">
              <input
                type="radio"
                name="agree"
                value="true"
                checked={formData.agree === 'true'}
                onChange={handleInputChange}
                required
              />
              <span className="terms-label">I agree to the terms and conditions</span>
            </label>
          </div>
          {/* Register Button */}
            <button
            type="submit"
            className="register-button dark-bg"
            onClick={handleRegister}
            >
            <span style={{ color: '#fff' }}>Register</span>
            <MdPersonAdd className="register-icon" />
            </button>
        </form>
      </div>
    </div>
    // </div>
  );
};

export default Register;