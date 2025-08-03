import React, { useState } from 'react';

const ChangePassword: React.FC<{ showToast: (msg: string, type?: 'success' | 'error') => void; onClose: () => void }> = ({ showToast, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5257/api/Auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.text();
        showToast(data || 'Şifre değiştirilemedi', 'error');
        return;
      }
      showToast('Şifre başarıyla değiştirildi!', 'success');
      setOldPassword('');
      setNewPassword('');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Şifre değiştirilemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-form card" style={{ maxWidth: 400, margin: '0 auto', position: 'relative' }}>
      <button onClick={onClose} className="modal-close">Kapat</button>
      <h2>Şifre Değiştir</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Eski Şifre: </label>
          <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Yeni Şifre: </label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="info-btn">{loading ? 'Değiştiriliyor...' : 'Değiştir'}</button>
      </form>
    </div>
  );
};

export default ChangePassword; 