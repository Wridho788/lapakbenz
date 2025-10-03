import React, { useState } from 'react';
import { useLogin } from '../api/hooks/index';
import type { LoginRequest } from '../api/types';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
    device: 'web'
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await loginMutation.mutateAsync(formData);
      
      if (result.success && result.token) {
        // Store token
        localStorage.setItem('authToken', result.token);
        
        // Call success callback
        onSuccess?.();
        
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleInputChange = (field: keyof LoginRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>
            Email, Phone, or Username
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange('username')}
            placeholder="Enter your email, phone, or username"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            required
          />
        </div>

        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                paddingRight: '40px'
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#666'
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {loginMutation.error && (
          <div style={{
            color: '#e74c3c',
            backgroundColor: '#fdf2f2',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #e74c3c',
            fontSize: '14px'
          }}>
            {loginMutation.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending || !formData.username || !formData.password}
          style={{
            backgroundColor: loginMutation.isPending ? '#95a5a6' : '#3498db',
            color: 'white',
            padding: '12px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {loginMutation.isPending ? 'Logging in...' : 'Login'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <a
            href="/forgot-password"
            style={{
              color: '#3498db',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            Forgot Password?
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
