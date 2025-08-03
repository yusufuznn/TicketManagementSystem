import React, { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { ErrorHandler } from '../utils/errorHandler';

interface PersonelStat {
  personelId: number;
  adSoyad: string;
  email: string;
  rol: string;
  total: number;
  open: number;
  closed: number;
  completed: number;
  avgSolutionHours: number;
  overdue: number;
}

const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [stats, setStats] = useState<any>(null);
  const [personelStats, setPersonelStats] = useState<PersonelStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [durum, setDurum] = useState('');
  const [personelId, setPersonelId] = useState('');
  const [personelList, setPersonelList] = useState<{ id: number; adSoyad: string }[]>([]);

  useEffect(() => {
    const fetchPersonelList = async () => {
      try {
        const data = await apiService.getPersonelList();
        setPersonelList(data);
      } catch (err: any) {
        const apiError = ErrorHandler.handleApiError(err);
        ErrorHandler.logError(apiError, 'AdminPanel-PersonelList');
      }
    };
    fetchPersonelList();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, personelData] = await Promise.all([
        apiService.getFilteredStatistics({
          start: start || undefined,
          end: end || undefined,
          durum: durum || undefined,
          personelId: personelId ? parseInt(personelId) : undefined,
        }),
        apiService.getPersonelStats(),
      ]);
      setStats(statsData);
      setPersonelStats(personelData);
      setLoading(false);
    } catch (err: any) {
      const apiError = ErrorHandler.handleApiError(err);
      setError(apiError.message);
      ErrorHandler.logError(apiError, 'AdminPanel-Stats');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExport = async () => {
    try {
      const blob = await apiService.exportCsv({
        start: start || undefined,
        end: end || undefined,
        durum: durum || undefined,
        personelId: personelId ? parseInt(personelId) : undefined,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tickets_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (err: any) {
      const apiError = ErrorHandler.handleApiError(err);
      ErrorHandler.logError(apiError, 'AdminPanel-Export');
      // Hata geri bildirimi
      setError('CSV indirilemedi: ' + apiError.message);
    }
  };

  return (
    <div className="card admin-panel" style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
      <button onClick={onClose} className="modal-close" title="Kapat">✕</button>
      <h1>Yönetici Paneli</h1>
      <div className="ticket-filters" style={{ marginBottom: 24 }}>
        <div className="filters-row">
          <label>Başlangıç Tarihi: <input type="date" value={start} onChange={e => setStart(e.target.value)} /></label>
          <label>Bitiş Tarihi: <input type="date" value={end} onChange={e => setEnd(e.target.value)} /></label>
          <label>Durum:
            <select value={durum} onChange={e => setDurum(e.target.value)}>
              <option value=''>Tümü</option>
              <option value='Yeni'>Yeni</option>
              <option value='Yanıt Bekleniyor'>Yanıt Bekleniyor</option>
              <option value='İşlemde'>İşlemde</option>
              <option value='Tamamlandı'>Tamamlandı</option>
              <option value='Müşteri Onayı Bekleniyor'>Müşteri Onayı Bekleniyor</option>
              <option value='Kapatıldı'>Kapatıldı</option>
              <option value='Yeniden Açıldı'>Yeniden Açıldı</option>
            </select>
          </label>
          <label>Personel:
            <select value={personelId} onChange={e => setPersonelId(e.target.value)}>
              <option value=''>Tümü</option>
              {personelList.map(p => (
                <option key={p.id} value={p.id}>{p.adSoyad}</option>
              ))}
            </select>
          </label>
          <button onClick={fetchStats} className="info-btn">Filtrele</button>
          <button onClick={handleExport} className="secondary-btn">CSV İndir</button>
        </div>
      </div>
      {loading ? <div>Yükleniyor...</div> : error ? <div className="danger-card">{error}</div> : stats && (
        <div className="card" style={{ marginBottom: 32 }}>
          <h2>Genel İstatistikler</h2>
          <ul>
            <li>Toplam Ticket: <b>{stats.total}</b></li>
            <li>Açık Ticket: <b>{stats.open}</b></li>
            <li>Kapanan Ticket: <b>{stats.closed}</b></li>
            <li>Tamamlanan Ticket: <b>{stats.completed}</b></li>
            <li>Ortalama Çözüm Süresi: <b>{stats.avgSolutionHours.toFixed(2)} saat</b></li>
            <li>Geciken Talepler (60+ saat): <b>{stats.overdue}</b></li>
          </ul>
        </div>
      )}
      <h2>Personel Performans Tablosu</h2>
      <div className="table-responsive">
        <table className="modern-table" style={{ marginBottom: 32 }}>
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Toplam Ticket</th>
              <th>Açık</th>
              <th>Kapanan</th>
              <th>Tamamlanan</th>
              <th>Ortalama Çözüm Süresi (saat)</th>
              <th>Geciken Ticket (60+ saat)</th>
            </tr>
          </thead>
          <tbody>
            {personelStats.map(p => (
              <tr key={p.personelId}>
                <td>{p.adSoyad}</td>
                <td>{p.email}</td>
                <td>{p.rol}</td>
                <td>{p.total}</td>
                <td>{p.open}</td>
                <td>{p.closed}</td>
                <td>{p.completed}</td>
                <td>{p.avgSolutionHours.toFixed(2)}</td>
                <td>{p.overdue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel; 