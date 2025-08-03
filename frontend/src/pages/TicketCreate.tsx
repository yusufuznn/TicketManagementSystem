import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { ErrorHandler } from '../utils/errorHandler';

const TicketCreate: React.FC<{ onCreated: () => void }> = ({ onCreated }) => {
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [onem, setOnem] = useState('Normal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await apiService.createTicket({ baslik, aciklama, onem });
      setSuccess(true);
      setBaslik('');
      setAciklama('');
      setOnem('Normal');
      onCreated();
    } catch (err: any) {
      const apiError = ErrorHandler.handleApiError(err);
      setError(apiError.message);
      ErrorHandler.logError(apiError, 'TicketCreate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ticket-create-form card">
      <h3>Yeni Ticket Oluştur</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Başlık: </label>
          <input type="text" value={baslik} onChange={e => setBaslik(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Açıklama: </label>
          <textarea value={aciklama} onChange={e => setAciklama(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Önem: </label>
          <select value={onem} onChange={e => setOnem(e.target.value)}>
            <option value="Normal">Normal</option>
            <option value="Yüksek">Yüksek</option>
            <option value="Düşük">Düşük</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="info-btn">{loading ? 'Ekleniyor...' : 'Ekle'}</button>
      </form>
      {error && <div className="danger-card" style={{ marginTop: 8 }}>{error}</div>}
      {success && <div className="success-card" style={{ marginTop: 8 }}>Ticket başarıyla eklendi!</div>}
    </div>
  );
};

export default TicketCreate; 