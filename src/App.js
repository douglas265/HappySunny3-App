import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';
import { API_URL } from './api'; // Ensure this points to your local backend

// Layout Components
import Header from './components/pages/Header';
import Footer from './components/pages/Footer';

// Page Components
import HomePage from './components/pages/HomePage';
import ServicesPage from './components/pages/SerevicesPage'; // Note: Keeps original filename spelling
import BookingPage from './components/pages/BookingPage';
import LoginPage from './components/pages/LoginPage';
import SignUpPage from './components/pages/SignUpPage';
import CustomerReservationsPage from './components/pages/CustomerReservationsPage';
import ForgotPasswordPage from './components/pages/ForgotPasswordPage';
import ResetPasswordPage from './components/pages/ResetPasswordPage';
import EmployeePortal from './components/pages/EmployeePortal';
import EmployerPortal from './components/pages/EmployerPortal';
import SettingsPage from './components/pages/SettingsPage';


// Centralized API URL
// const API_URL = 'https://lily-spa-backend.onrender.com/api';
// const API_URL = 'http://localhost:3001/api';

// --- Page Components ---

// --- Employer Portal Components ---



// --- Main App Component ---
export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [services, setServices] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);

  const fetchPublicData = useCallback(async () => {
    try {
        const [servicesRes, storeInfoRes] = await Promise.all([
            fetch(`${API_URL}/services`),
            fetch(`${API_URL}/store-info`),
        ]);
        setServices(await servicesRes.json());
        setStoreInfo(await storeInfoRes.json());
    } catch (error) {
        console.error("Failed to fetch public data:", error);
    }
  }, []);
  
  const fetchTherapists = useCallback(async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const therapistsRes = await fetch(`${API_URL}/therapists`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (therapistsRes.ok) {
            setTherapists(await therapistsRes.json());
        } else {
            setTherapists([]);
        }
      } catch (error) {
        console.error("Failed to fetch therapists:", error);
        setTherapists([]);
      }
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/reset-password/')) {
      const token = path.split('/')[2];
      setResetToken(token);
      setPage('resetPassword');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setUser(data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);
  
  useEffect(() => {
      if (user) {
          fetchTherapists();
      }
  }, [user, fetchTherapists]);


  const navigate = (newPage) => {
    setPage(newPage);
    setIsMobileMenuOpen(false);
    if (newPage !== 'resetPassword') {
        const path = newPage === 'home' ? '/' : `/${newPage}`;
        window.history.pushState({}, '', path);
    }
    window.scrollTo(0, 0);
  };

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
    const role = data.user.role;
    if (role === 'customer') navigate('myReservations');
    else if (role === 'employee') navigate('employeePortal');
    else if (['employer', 'admin', 'frontdesk'].includes(role)) navigate('employerPortal');
    else navigate('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('home');
  };
  
  const renderPage = () => {
    const props = { user, navigate, services, therapists, storeInfo, onServicesUpdate: setServices, onUsersUpdate: fetchTherapists };

    switch(page) {
      case 'home': return <HomePage {...props} />;
      case 'services': return <ServicesPage {...props} />;
      case 'book': return <BookingPage {...props} />;
      case 'login': return <LoginPage onLogin={handleLogin} navigate={navigate} />;
      case 'signup': return <SignUpPage onSignUp={handleLogin} />;
      case 'myReservations': return <CustomerReservationsPage {...props} />;
      case 'forgotPassword': return <ForgotPasswordPage />;
      case 'resetPassword': return <ResetPasswordPage token={resetToken} navigate={navigate} />;
      case 'employeePortal': return <EmployeePortal {...props} />;
      case 'employerPortal': return <EmployerPortal {...props} />;
      case 'settings': return <SettingsPage {...props} />;
      default: return <HomePage {...props} />;
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-pink-500">Loading...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      <Header user={user} navigate={navigate} handleLogout={handleLogout} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <main className="container mx-auto px-4 sm:px-6 py-12">
        {renderPage()}
      </main>
      <Footer storeInfo={storeInfo} />
    </div>
  );
}

// --- Reusable Layout Components ---

