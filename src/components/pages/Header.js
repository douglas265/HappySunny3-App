import React from 'react';
import { LogIn, LogOut, Menu, X, Settings } from 'lucide-react';

const Header = ({ user, navigate, handleLogout, isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const NavLinks = ({ isMobile = false }) => (
      <div className={`flex ${isMobile ? 'flex-col space-y-4 items-start p-4' : 'flex-row items-center space-x-6'}`}>
        <button onClick={() => navigate('home')} className="hover:text-pink-400 transition-colors">Home</button>
        <button onClick={() => navigate('services')} className="hover:text-pink-400 transition-colors">Services</button>
        <button onClick={() => navigate('book')} className="hover:text-pink-400 transition-colors">Book Now</button>
        {user ? (
          <>
            {user.role === 'customer' && <button onClick={() => navigate('myReservations')} className="hover:text-pink-400 transition-colors">My Reservations</button>}
            {user.role === 'employee' && <button onClick={() => navigate('employeePortal')} className="hover:text-pink-400 transition-colors">Employee Portal</button>}
            {['employer', 'admin', 'frontdesk'].includes(user.role) && <button onClick={() => navigate('employerPortal')} className="hover:text-pink-400 transition-colors">Admin Portal</button>}
            <button onClick={() => navigate('settings')} className="hover:text-pink-400 transition-colors flex items-center"><Settings className="mr-1 h-4 w-4"/> Settings</button>
            <button onClick={handleLogout} className={`flex items-center text-red-500 hover:text-red-700 transition-colors`}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </button>
          </>
        ) : (
          <button onClick={() => navigate('login')} className="flex items-center bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors">
            <LogIn className="mr-2 h-4 w-4" /> Login / Sign Up
          </button>
        )}
      </div>
    );
    
    return (
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-pink-500 cursor-pointer" onClick={() => navigate('home')}>
            Lily Spa
          </div>
          <div className="hidden md:flex">
            <NavLinks />
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
        {isMobileMenuOpen && ( <div className="md:hidden bg-white py-2 border-t"> <NavLinks isMobile={true} /> </div> )}
      </header>
    );
  };
  
  export default Header;