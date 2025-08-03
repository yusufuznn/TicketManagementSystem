import React, { useEffect, useState } from 'react';
import TicketCreate from './TicketCreate';
import TicketDetail from './TicketDetail';
import { apiService } from '../services/apiService';
import { AuthUtils } from '../utils/authUtils';
import { ErrorHandler } from '../utils/errorHandler';

interface Ticket {
  id: number;
  baslik: string;
  aciklama: string;
  onem: string;
  durum: string;
  musteriId: number;
  olusturmaTarihi: string;
  sonGuncellemeTarihi: string;
  AtananPersonelId?: number;
}

const TicketList: React.FC<{ showToast: (msg: string, type?: 'success' | 'error') => void }> = ({ showToast }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Ticket>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [assignId, setAssignId] = useState<number | null>(null);
  const [personelList, setPersonelList] = useState<{ id: number; adSoyad: string; email: string; rol: string }[]>([]);
  const [assignPersonelId, setAssignPersonelId] = useState<number | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [filterOnem, setFilterOnem] = useState('');
  const [filterDurum, setFilterDurum] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await apiService.getTickets();
        setTickets(data);
        setLoading(false);
      } catch (err: any) {
        const apiError = ErrorHandler.handleApiError(err);
        setError(apiError.message);
        ErrorHandler.logError(apiError, 'TicketList');
        setLoading(false);
      }
    };

    fetchTickets();
  }, [refresh]);

  const handleEdit = (ticket: Ticket) => {
    setEditId(ticket.id);
    setEditData({ ...ticket });
    setEditError(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    if (!editId) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await apiService.updateTicket(editId, {
        baslik: editData.baslik || '',
        aciklama: editData.aciklama || '',
        onem: editData.onem || 'Normal',
        durum: editData.durum || 'Yeni',
      });
      setEditId(null);
      setEditData({});
      setRefresh(r => r + 1);
      showToast('Ticket güncellendi!', 'success');
    } catch (err: any) {
      const apiError = ErrorHandler.handleApiError(err);
      setEditError(apiError.message);
      showToast(apiError.message, 'error');
      ErrorHandler.logError(apiError, 'TicketList-Edit');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditData({});
    setEditError(null);
  };

  const fetchPersonelList = async () => {
    try {
      const data = await apiService.getPersonelList();
      setPersonelList(data);
    } catch (err: any) {
      const apiError = ErrorHandler.handleApiError(err);
      ErrorHandler.logError(apiError, 'TicketList-PersonelList');
    }
  };

  const handleAssignClick = async (ticket: Ticket) => {
    setAssignId(ticket.id);
    setAssignPersonelId(ticket.AtananPersonelId || null);
    await fetchPersonelList();
  };

  const handleAssignSave = async () => {
    if (!assignId || !assignPersonelId) return;
    setAssignLoading(true);
    try {
      await apiService.assignTicket(assignId, assignPersonelId);
      setAssignId(null);
      setAssignPersonelId(null);
      setRefresh(r => r + 1);
      showToast('Ticket atandı/devredildi!', 'success');
    } catch (err: any) {
      const apiError = ErrorHandler.handleApiError(err);
      showToast(apiError.message, 'error');
      ErrorHandler.logError(apiError, 'TicketList-Assign');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignCancel = () => {
    setAssignId(null);
    setAssignPersonelId(null);
  };

  const userRole = AuthUtils.getUserRole();
  const userId = AuthUtils.getUserId();

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu ticketı silmek istediğinize emin misiniz?')) return;
    try {
      await apiService.deleteTicket(id);
      setRefresh(r => r + 1);
      showToast('Ticket silindi!', 'success');
    } catch (err: any) {
      const apiError = ErrorHandler.handleApiError(err);
      showToast(apiError.message, 'error');
      ErrorHandler.logError(apiError, 'TicketList-Delete');
    }
  };

  const filteredTickets = tickets.filter(t => {
    const onemMatch = !filterOnem || t.onem === filterOnem;
    const durumMatch = !filterDurum || t.durum === filterDurum;
    const startMatch = !filterStart || new Date(t.olusturmaTarihi) >= new Date(filterStart);
    const endMatch = !filterEnd || new Date(t.olusturmaTarihi) <= new Date(filterEnd);
    return onemMatch && durumMatch && startMatch && endMatch;
  });

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <div className="ticket-list-page">
      <div className="card ticket-filters" style={{ marginBottom: 24 }}>
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
      {userRole === 'Musteri' ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <TicketCreate onCreated={() => { setRefresh(r => r + 1); showToast('Ticket eklendi!', 'success'); }} />
        </div>
      ) : (
        <div className="card warning-card" style={{ marginBottom: 24 }}>
          Ticket oluşturma özelliği sadece müşterilere özeldir.
        </div>
      )}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Ticket Listesi</h2>
        {detailTicket && <TicketDetail ticket={detailTicket} onClose={() => setDetailTicket(null)} />}
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
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>
                      {editId === t.id ? (
                        <input name="baslik" value={editData.baslik || ''} onChange={handleEditChange} />
                      ) : (
                        t.baslik
                      )}
                    </td>
                    <td>
                      {editId === t.id ? (
                        <textarea name="aciklama" value={editData.aciklama || ''} onChange={handleEditChange} />
                      ) : (
                        t.aciklama
                      )}
                    </td>
                    <td>
                      {editId === t.id ? (
                        <select name="onem" value={editData.onem || 'Normal'} onChange={handleEditChange}>
                          <option value="Normal">Normal</option>
                          <option value="Yüksek">Yüksek</option>
                          <option value="Düşük">Düşük</option>
                        </select>
                      ) : (
                        t.onem
                      )}
                    </td>
                    <td>
                      {editId === t.id ? (
                        <select name="durum" value={editData.durum || 'Yeni'} onChange={handleEditChange}>
                          <option value="Yeni">Yeni</option>
                          <option value="Yanıt Bekleniyor">Yanıt Bekleniyor</option>
                          <option value="İşlemde">İşlemde</option>
                          <option value="Tamamlandı">Tamamlandı</option>
                          <option value="Müşteri Onayı Bekleniyor">Müşteri Onayı Bekleniyor</option>
                          <option value="Kapatıldı">Kapatıldı</option>
                          <option value="Yeniden Açıldı">Yeniden Açıldı</option>
                        </select>
                      ) : (
                        t.durum
                      )}
                    </td>
                    <td>{t.musteriId}</td>
                    <td>{new Date(t.olusturmaTarihi).toLocaleString()}</td>
                    <td>{new Date(t.sonGuncellemeTarihi).toLocaleString()}</td>
                    <td>
                      {editId === t.id ? (
                        <>
                          <button onClick={handleEditSave} disabled={editLoading}>Kaydet</button>
                          <button onClick={handleEditCancel} disabled={editLoading} className="secondary-btn">İptal</button>
                          {editError && <div style={{ color: 'red' }}>{editError}</div>}
                        </>
                      ) : (
                        <>
                          {(userRole === 'Admin' || userRole === 'Yonetici' || userRole === 'Personel' || (userRole === 'Musteri' && Number(userId) === t.musteriId)) && (
                            <button onClick={() => handleEdit(t)}>Düzenle</button>
                          )}
                          {userRole === 'Admin' && (
                            <button onClick={() => handleDelete(t.id)} className="danger-btn">Sil</button>
                          )}
                          {(userRole === 'Admin' || userRole === 'Yonetici' || userRole === 'Personel') && (
                            <button onClick={() => handleAssignClick(t)} className="info-btn">Ata/Devret</button>
                          )}
                          <button onClick={() => setDetailTicket(t)} className="secondary-btn">Detay</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {assignId && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button onClick={handleAssignCancel} className="modal-close">×</button>
            <h3>Ticket Ata/Devret</h3>
            <select value={assignPersonelId || ''} onChange={e => setAssignPersonelId(Number(e.target.value))} style={{ width: '100%', marginBottom: 16 }}>
              <option value=''>Personel seçin</option>
              {personelList.map(p => (
                <option key={p.id} value={p.id}>{p.adSoyad} ({p.rol})</option>
              ))}
            </select>
            <button onClick={handleAssignSave} disabled={assignLoading || !assignPersonelId}>{assignLoading ? 'Atanıyor...' : 'Kaydet'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList; 