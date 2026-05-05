import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DriverDashboard from './pages/DriverDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user.role === 'DRIVER' ? (
        <DriverDashboard user={user} onLogout={handleLogout} />
      ) : user.role === 'MANAGER' ? (
        <ManagerDashboard user={user} onLogout={handleLogout} />
      ) : (
        <div className="p-8">Unknown role</div>
      )}
    </div>
  );
}

export default App;
