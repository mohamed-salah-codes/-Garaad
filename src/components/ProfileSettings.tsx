import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

import { FiCamera, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import './ProfileSettings.css';

interface ProfileSettingsProps {
  activeTab: 'My profile' | 'Preferences' | 'Integrations' | 'Security';
}

export default function ProfileSettings({ activeTab }: ProfileSettingsProps) {
  const { user, updateProfile, updatePassword, uploadAvatar } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // My Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdayDay, setBirthdayDay] = useState('Day');
  const [birthdayMonth, setBirthdayMonth] = useState('Month');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user && user.user_metadata) {
      const fullName = user.user_metadata.full_name || '';
      const parts = fullName.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setAvatarUrl(user.user_metadata.avatar_url || null);
    }
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    let finalAvatarUrl = avatarUrl;

    // Handle avatar upload if a new file was selected
    if (selectedAvatarFile) {
      const { error: uploadErr, url } = await uploadAvatar(selectedAvatarFile);
      if (uploadErr) {
        showToast(uploadErr, 'error');
        setLoading(false);
        return;
      }
      if (url) {
        finalAvatarUrl = url;
      }
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const { error } = await updateProfile({ 
      full_name: fullName, 
      avatar_url: finalAvatarUrl as any
    });
    
    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Profile updated successfully', 'success');
      setSelectedAvatarFile(null);
    }
    setLoading(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Only JPG, PNG, and WebP formats are supported', 'error');
      return;
    }

    // Set for local preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    setSelectedAvatarFile(file);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(newPassword);
    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  if (activeTab === 'Security') {
    return (
      <div className="profile-settings-container">
        <div className="settings-section">
          <div className="settings-form-group" style={{ maxWidth: '300px' }}>
            <label>Current password</label>
            <div className="password-input-wrapper">
              <input 
                type={showCurrent ? 'text' : 'password'} 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button type="button" className="password-toggle-btn" onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <div className="settings-form-group" style={{ maxWidth: '300px' }}>
            <label>New password</label>
            <div className="password-input-wrapper">
              <input 
                type={showNew ? 'text' : 'password'} 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button type="button" className="password-toggle-btn" onClick={() => setShowNew(!showNew)}>
                {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <div className="settings-form-group" style={{ maxWidth: '300px' }}>
            <label>Confirm new password</label>
            <div className="password-input-wrapper">
              <input 
                type={showConfirm ? 'text' : 'password'} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button type="button" className="password-toggle-btn" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <button 
            className="save-button" 
            onClick={handleChangePassword}
            disabled={loading || !newPassword || !confirmPassword}
            style={{ marginTop: '12px' }}
          >
            {loading ? 'Saving...' : 'Change password'}
          </button>
        </div>

        {toast && (
          <div className={`toast-message toast-${toast.type}`}>
            {toast.message}
          </div>
        )}
      </div>
    );
  }

  // default to 'My profile'
  return (
    <div className="profile-settings-container">
      <div className="profile-settings-header">
        <div className="profile-avatar-large" onClick={() => fileInputRef.current?.click()}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" />
          ) : (
            <span className="avatar-placeholder">{firstName.charAt(0) || 'M'}</span>
          )}
          <div className="avatar-overlay">
            <FiCamera size={20} />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarUpload} 
            accept="image/jpeg, image/png, image/webp"
            style={{ display: 'none' }} 
          />
        </div>
        <div className="profile-info-header">
          <h2>{firstName} {lastName}</h2>
          <p>
            {user?.email} 
            <span className="profile-link" style={{ marginLeft: '8px' }}>change email</span>
          </p>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-row">
          <div className="settings-form-group">
            <label>First name</label>
            <input 
              type="text" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
            />
          </div>
          <div className="settings-form-group">
            <label>Last name</label>
            <input 
              type="text" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
            />
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-form-group" style={{ flex: 0.5 }}>
            <label>Birthday</label>
            <div className="birthday-row">
              <select value={birthdayDay} onChange={(e) => setBirthdayDay(e.target.value)}>
                <option>Day</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1}>{i + 1}</option>
                ))}
              </select>
              <select value={birthdayMonth} onChange={(e) => setBirthdayMonth(e.target.value)}>
                <option>Month</option>
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          className="save-button" 
          onClick={handleSaveProfile}
          disabled={loading}
          style={{ marginTop: '16px' }}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="danger-section">
        <h3>Delete account</h3>
        <p>
          After deleting your account you will lose all related information including tasks, events, projects, notes etc. You will not be able to recover it later, so think twice before doing this.
        </p>
        <button className="danger-button">
          <FiTrash2 size={16} /> Delete account
        </button>
      </div>

      {toast && (
        <div className={`toast-message toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
