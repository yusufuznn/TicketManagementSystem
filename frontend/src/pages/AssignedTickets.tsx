import React, { useEffect, useState } from 'react';

interface Ticket {
  id: number;
  baslik: string;
  aciklama: string;
  onem: string;
  durum: string;
  musteriId: number;
  atananPersonelId?: number;
  olusturmaTarihi: string;
  sonGuncellemeTarihi: string;
}

const AssignedTickets: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOnem, setFilterOnem] = useState('');
  const [filterDurum, setFilterDurum] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5257/api/Ticket/assigned-to-me', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('API hatası');
        return res.json();
      })
      .then((data) => {
        setTickets(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  const filteredTickets = tickets.filter(t => {
    const onemMatch = !filterOnem || t.onem === filterOnem;
    const durumMatch = !filterDurum || t.durum === filterDurum;
    const startMatch = !filterStart || new Date(t.olusturmaTarihi) >= new Date(filterStart);
    const endMatch = !filterEnd || new Date(t.olusturmaTarihi) <= new Date(filterEnd);
    return onemMatch && durumMatch && startMatch && endMatch;
  });

  return (
    <div className="card assigned-tickets-panel" style={{ position: 'relative' }}>
      <button onClick={onClose} className="modal-close" title="Kapat">✕</button>
      <div className="ticket-filters" style={{ marginBottom: 16 }}>
        <div className="filters-row">
          <label>Önem:
            <select value={filterOnem} onChange={e => setFilterOnem(e.target.value)}>
              <option value=''>Tümü</option>
              <option value='Düşük'>Düşük</option>
              <option value='Normal'>Normal</option>
              <option value='Yüksek'>Yüksek</option>
            </select>
          </label>
          <label>Durum:
            <select value={filterDurum} onChange={e => setFilterDurum(e.target.value)}>
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
          <label>Başlangıç Tarihi:
            <input type='date' value={filterStart} onChange={e => setFilterStart(e.target.value)} />
          </label>
          <label>Bitiş Tarihi:
            <input type='date' value={filterEnd} onChange={e => setFilterEnd(e.target.value)} />
          </label>
        </div>
      </div>
      <h2>Kendime Atanan Ticketlar</h2>
      {filteredTickets.length === 0 ? (
        <div>Hiç ticket yok.</div>
      ) : (
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Başlık</th>
                <th>Açıklama</th>
                <th>Önem</th>
                <th>Durum</th>
                <th>Müşteri ID</th>
                <th>Oluşturma Tarihi</th>
                <th>Son Güncelleme</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.baslik}</td>
                  <td>{t.aciklama}</td>
                  <td>{t.onem}</td>
                  <td>{t.durum}</td>
                  <td>{t.musteriId}</td>
                  <td>{new Date(t.olusturmaTarihi).toLocaleString()}</td>
                  <td>{new Date(t.sonGuncellemeTarihi).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssignedTickets; 