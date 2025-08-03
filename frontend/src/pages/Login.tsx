import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { AuthUtils } from '../utils/authUtils';
import { ErrorHandler } from '../utils/errorHandler';

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { token } = await apiService.login(email, password);
      AuthUtils.setToken(token);
      onLogin();
    } catch (err: any) {
      const apiError = ErrorHandler.handleApiError(err);
      setError(apiError.message);
      ErrorHandler.logError(apiError, 'Login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form card">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>E-posta: </label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Şifre: </label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="info-btn">{loading ? 'Giriş...' : 'Giriş Yap'}</button>
      </form>
      {error && <div className="danger-card" style={{ marginTop: 8 }}>{error}</div>}
    </div>
  );
};

export default Login; 