import React, { useState } from 'react';

const Register: React.FC<{ onRegister: () => void }> = ({ onRegister }) => {
  const [adSoyad, setAdSoyad] = useState('');
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [rol, setRol] = useState('Musteri');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('http://localhost:5257/api/Auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adSoyad, email, sifre, rol }),
      });
      if (!res.ok) {
        const data = await res.text();
        throw new Error(data || 'Kayıt başarısız');
      }
      setSuccess(true);
      onRegister();
    } catch (err: any) {
      setError(err.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form card">
      <h2>Kayıt Ol</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Ad Soyad: </label>
          <input type="text" value={adSoyad} onChange={e => setAdSoyad(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>E-posta: </label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Şifre: </label>
          <input type="password" value={sifre} onChange={e => setSifre(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Rol: </label>
          <select value={rol} onChange={e => setRol(e.target.value)}>
            <option value="Musteri">Müşteri</option>
            <option value="Admin">Admin</option>
            <option value="Yonetici">Yönetici</option>
            <option value="Personel">Personel</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="info-btn">{loading ? 'Kayıt...' : 'Kayıt Ol'}</button>
      </form>
      {error && <div className="danger-card" style={{ marginTop: 8 }}>{error}</div>}
      {success && <div className="success-card" style={{ marginTop: 8 }}>Kayıt başarılı! Giriş yapabilirsiniz.</div>}
    </div>
  );
};

export default Register; 