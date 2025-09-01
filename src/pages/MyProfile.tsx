import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import './AccountPages.css';

const MyProfile: React.FC = () => {
  const navigate = useNavigate();

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
          <h3>My Profile Information</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" defaultValue="John Doe" placeholder="Enter your full name" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" defaultValue="+62 812-3456-7890" placeholder="+62 xxx-xxxx-xxxx" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" defaultValue="john.doe@email.com" placeholder="your.email@example.com" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea defaultValue="Jl. Sudirman No. 123" placeholder="Enter your complete address" rows={3}></textarea>
          </div>
          <div className="form-group">
            <label>Zip Code</label>
            <input type="text" defaultValue="12345" placeholder="Enter zip code" />
          </div>
          <div className="form-group">
            <label>City</label>
            <select defaultValue="Jakarta">
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
            <input type="text" defaultValue="Software Engineer" placeholder="Enter your profession" />
          </div>
          <div className="form-group">
            <label>Organization</label>
            <input type="text" defaultValue="Tech Company" placeholder="Enter your organization/company" />
          </div>
          <div className="form-group">
            <label>Instagram</label>
            <input type="text" defaultValue="@johndoe" placeholder="@username" />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" defaultValue="1990-01-01" />
          </div>
          <button className="save-btn">Update Profile</button>
        </div>
      </div>
      
      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default MyProfile;
