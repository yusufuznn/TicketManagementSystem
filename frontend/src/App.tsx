import React from 'react';
import logo from './ticketly.png';
import './App.css';
import TicketList from './pages/TicketList';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Toast from './pages/Toast';
import AssignedTickets from './pages/AssignedTickets';
import AdminPanel from './pages/AdminPanel';
import { AuthUtils } from './utils/authUtils';

// Yeni Navbar 
function Navbar({ isLoggedIn, userRole, onNav, onLogout }: { isLoggedIn: boolean; userRole: string | null; onNav: (panel: string) => void; onLogout: () => void }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Logo" style={{ height: 36, verticalAlign: 'middle' }} />
        <span className="navbar-title">Ticket System</span>
      </div>
      {isLoggedIn && (
        <div className="navbar-menu">
          {(userRole === 'Admin' || userRole === 'Yonetici') && (
            <button onClick={() => onNav('admin')}>Yönetici Paneli</button>
          )}
          {userRole !== 'Musteri' && (
            <button onClick={() => onNav('assigned')}>Personel Paneli</button>
          )}
          <button onClick={() => onNav('profile')}>Profil</button>
          <button onClick={() => onNav('changePassword')}>Şifre Değiştir</button>
          <button onClick={onLogout}>Çıkış Yap</button>
        </div>
      )}
    </nav>
  );
}

// Yeni Footer
function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} Ticket System</span>
    </footer>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(AuthUtils.isAuthenticated());
  const [showRegister, setShowRegister] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const [showAssigned, setShowAssigned] = React.useState(false);
  const [showAdminPanel, setShowAdminPanel] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type?: 'success' | 'error') => setToast({ message, type });

  const userRole = AuthUtils.getUserRole();

  // Navbar butonlarına handler
  const handleNav = (panel: string) => {
    setShowAdminPanel(panel === 'admin');
    setShowAssigned(panel === 'assigned');
    setShowProfile(panel === 'profile');
    setShowChangePassword(panel === 'changePassword');
  };

  const handleLogout = () => {
    AuthUtils.removeToken();
    setIsLoggedIn(false);
    showToast('Çıkış yapıldı.', 'success');
    setShowAdminPanel(false);
    setShowAssigned(false);
    setShowProfile(false);
    setShowChangePassword(false);
  };

  return (
    <div className="App">
      <Navbar isLoggedIn={isLoggedIn} userRole={userRole} onNav={handleNav} onLogout={handleLogout} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <main className="main-content">
        {isLoggedIn ? (
          <>
            {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}
            {showAssigned && <AssignedTickets onClose={() => setShowAssigned(false)} />}
            {showProfile && <Profile showToast={showToast} onClose={() => setShowProfile(false)} />}
            {showChangePassword && <ChangePassword showToast={showToast} onClose={() => setShowChangePassword(false)} />}
            {!showAdminPanel && !showAssigned && !showProfile && !showChangePassword && <TicketList showToast={showToast} />}
          </>
        ) : showRegister ? (
          <>
            <Register onRegister={() => setShowRegister(false)} />
            <button onClick={() => setShowRegister(false)} style={{ marginTop: 12 }}>Giriş Yap</button>
          </>
        ) : (
          <>
            <Login onLogin={() => setIsLoggedIn(true)} />
            <button onClick={() => setShowRegister(true)} style={{ marginTop: 12 }}>Kayıt Ol</button>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
