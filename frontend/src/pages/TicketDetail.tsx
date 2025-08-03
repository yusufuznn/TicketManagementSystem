import React, { useEffect, useState } from 'react';

interface TicketDetailProps {
  ticket: {
    id: number;
    baslik: string;
    aciklama: string;
    onem: string;
    durum: string;
    musteriId: number;
    olusturmaTarihi: string;
    sonGuncellemeTarihi: string;
  };
  onClose: () => void;
}

interface TicketYorum {
  id: number;
  kullaniciId: number;
  yorum: string;
  tarih: string;
}

interface TicketEk {
  id: number;
  dosyaAdi: string;
  dosyaYolu: string;
  boyut: number;
  uzanti: string;
  eklenmeTarihi: string;
}

interface TicketTimeline {
  id: number;
  ticketId: number;
  kullaniciId: number | null;
  islem: string;
  aciklama?: string;
  tarih: string;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticket, onClose }) => {
  const [yorumlar, setYorumlar] = useState<TicketYorum[]>([]);
  const [yorum, setYorum] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yorumLoading, setYorumLoading] = useState(false);
  const [yorumError, setYorumError] = useState<string | null>(null);
  const [ekler, setEkler] = useState<TicketEk[]>([]);
  const [ekLoading, setEkLoading] = useState(true);
  const [ekError, setEkError] = useState<string | null>(null);
  const [dosya, setDosya] = useState<File | null>(null);
  const [dosyaYukleLoading, setDosyaYukleLoading] = useState(false);
  const [dosyaYukleError, setDosyaYukleError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TicketTimeline[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(true);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5257/api/Yorum/${ticket.id}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Yorumlar alınamadı');
        return res.json();
      })
      .then(data => {
        setYorumlar(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    // Ekleri çek
    setEkLoading(true);
    setEkError(null);
    fetch(`http://localhost:5257/api/Ek/${ticket.id}`, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    })
      .then(res => {
        if (!res.ok) throw new Error('Ekler alınamadı');
        return res.json();
      })
      .then(data => {
        setEkler(data);
        setEkLoading(false);
      })
      .catch(err => {
        setEkError(err.message);
        setEkLoading(false);
      });

    // Timeline'ı çek
    setTimelineLoading(true);
    setTimelineError(null);
    fetch(`http://localhost:5257/api/Timeline/${ticket.id}`, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    })
      .then(res => {
        if (!res.ok) throw new Error('Süreç takibi alınamadı');
        return res.json();
      })
      .then(data => {
        setTimeline(data);
        setTimelineLoading(false);
      })
      .catch(err => {
        setTimelineError(err.message);
        setTimelineLoading(false);
      });
  }, [ticket.id]);

  const handleYorumEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    setYorumLoading(true);
    setYorumError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5257/api/Yorum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ ticketId: ticket.id, yorum }),
      });
      if (!res.ok) {
        const data = await res.text();
        throw new Error(data || 'Yorum eklenemedi');
      }
      setYorum('');
      // Yorumları tekrar çek
      const yorumRes = await fetch(`http://localhost:5257/api/Yorum/${ticket.id}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });
      if (yorumRes.ok) {
        setYorumlar(await yorumRes.json());
      }
    } catch (err: any) {
      setYorumError(err.message || 'Yorum eklenemedi');
    } finally {
      setYorumLoading(false);
    }
  };

  const handleDosyaYukle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dosya) return;
    setDosyaYukleLoading(true);
    setDosyaYukleError(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('TicketId', ticket.id.toString());
      formData.append('Dosya', dosya);
      const res = await fetch('http://localhost:5257/api/Ek/upload', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.text();
        throw new Error(data || 'Dosya yüklenemedi');
      }
      setDosya(null);
      // Ekleri tekrar çek
      const ekRes = await fetch(`http://localhost:5257/api/Ek/${ticket.id}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });
      if (ekRes.ok) setEkler(await ekRes.json());
    } catch (err: any) {
      setDosyaYukleError(err.message || 'Dosya yüklenemedi');
    } finally {
      setDosyaYukleLoading(false);
    }
  };

  const handleDownload = (ekId: number) => {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:5257/api/Ek/download/${ekId}?token=${token}`, '_blank');
  };

  function getRoleFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload["role"] || null;
    } catch {
      return null;
    }
  }
  function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload["sub"] || payload["nameid"] || null;
    } catch {
      return null;
    }
  }
  const userRole = getRoleFromToken();
  const userId = getUserIdFromToken();

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 600 }}>
        <button onClick={onClose} className="modal-close">×</button>
        <h2>Ticket Detay</h2>
        <div className="ticket-detail-fields">
          <div><b>ID:</b> {ticket.id}</div>
          <div><b>Başlık:</b> {ticket.baslik}</div>
          <div><b>Açıklama:</b> {ticket.aciklama}</div>
          <div><b>Önem:</b> {ticket.onem}</div>
          <div><b>Durum:</b> {ticket.durum}</div>
          <div><b>Müşteri ID:</b> {ticket.musteriId}</div>
          <div><b>Oluşturma Tarihi:</b> {new Date(ticket.olusturmaTarihi).toLocaleString()}</div>
          <div><b>Son Güncelleme:</b> {new Date(ticket.sonGuncellemeTarihi).toLocaleString()}</div>
        </div>
        <hr />
        <h3>Yorumlar</h3>
        {loading ? (
          <div>Yorumlar yükleniyor...</div>
        ) : error ? (
          <div className="danger-card">{error}</div>
        ) : yorumlar.length === 0 ? (
          <div>Henüz yorum yok.</div>
        ) : (
          <ul className="ticket-comments">
            {yorumlar.map(y => (
              <li key={y.id}>
                <b>Kullanıcı {y.kullaniciId}:</b> {y.yorum} <span className="comment-date">({new Date(y.tarih).toLocaleString()})</span>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleYorumEkle} style={{ marginTop: 16 }}>
          {((userRole === 'Admin' || userRole === 'Yonetici' || userRole === 'Personel') || (userRole === 'Musteri' && Number(userId) === ticket.musteriId)) && (
            <>
              <textarea value={yorum} onChange={e => setYorum(e.target.value)} required placeholder="Yorum yazın..." style={{ width: '100%' }} />
              <button type="submit" disabled={yorumLoading || !yorum} className="info-btn">{yorumLoading ? 'Ekleniyor...' : 'Yorum Ekle'}</button>
              {yorumError && <div className="danger-card" style={{ marginTop: 8 }}>{yorumError}</div>}
            </>
          )}
        </form>
        <hr />
        <h3>Ekler</h3>
        {ekLoading ? (
          <div>Ekler yükleniyor...</div>
        ) : ekError ? (
          <div className="danger-card">{ekError}</div>
        ) : ekler.length === 0 ? (
          <div>Henüz ek yok.</div>
        ) : (
          <ul className="ticket-attachments">
            {ekler.map(ek => (
              <li key={ek.id}>
                <b>{ek.dosyaAdi}</b> ({(ek.boyut / 1024).toFixed(1)} KB, {ek.uzanti})
                <button onClick={() => handleDownload(ek.id)} className="secondary-btn">İndir</button>
                <span className="comment-date">({new Date(ek.eklenmeTarihi).toLocaleString()})</span>
              </li>
            ))}
          </ul>
        )}
        {((userRole === 'Admin' || userRole === 'Yonetici' || userRole === 'Personel') || (userRole === 'Musteri' && Number(userId) === ticket.musteriId)) && (
          <form onSubmit={handleDosyaYukle} style={{ marginTop: 16 }}>
            <input type="file" onChange={e => setDosya(e.target.files?.[0] || null)} />
            <button type="submit" disabled={dosyaYukleLoading || !dosya} className="info-btn">{dosyaYukleLoading ? 'Yükleniyor...' : 'Dosya Yükle'}</button>
            {dosyaYukleError && <div className="danger-card" style={{ marginTop: 8 }}>{dosyaYukleError}</div>}
          </form>
        )}
        <hr />
        <h3>Süreç Takibi</h3>
        {timelineLoading ? (
          <div>Süreç takibi yükleniyor...</div>
        ) : timelineError ? (
          <div className="danger-card">{timelineError}</div>
        ) : timeline.length === 0 ? (
          <div>Henüz süreç kaydı yok.</div>
        ) : (
          <ul className="ticket-timeline">
            {timeline.map(tl => (
              <li key={tl.id}>
                <b>{tl.islem}</b> {tl.aciklama && <>- {tl.aciklama}</>} <span className="comment-date">({new Date(tl.tarih).toLocaleString()})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TicketDetail; 