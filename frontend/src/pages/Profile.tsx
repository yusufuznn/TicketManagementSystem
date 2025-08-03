import React, { useState } from 'react';

function getNameFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || payload["name"] || '';
  } catch {
    return '';
  }
}
function getEmailFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || payload["email"] || '';
  } catch {
    return '';
  }
}

const Profile: React.FC<{ showToast: (msg: string, type?: 'success' | 'error') => void; onClose: () => void }> = ({ showToast, onClose }) => {
  const [adSoyad, setAdSoyad] = useState(getNameFromToken());
  const [email, setEmail] = useState(getEmailFromToken());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5257/api/Auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ adSoyad, email }),
      });
      if (!res.ok) {
        const data = await res.text();
        showToast(data || 'Profil güncellenemedi', 'error');
        return;
      }
      showToast('Profil başarıyla güncellendi!', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Profil güncellenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-form card" style={{ maxWidth: 400, margin: '0 auto', position: 'relative' }}>
      <button onClick={onClose} className="modal-close">Kapat</button>
      <h2>Profil Bilgileri</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Ad Soyad: </label>
          <input type="text" value={adSoyad} onChange={e => setAdSoyad(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>E-posta: </label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="info-btn">{loading ? 'Kaydediliyor...' : 'Kaydet'}</button>
      </form>
    </div>
  );
};

export default Profile; 