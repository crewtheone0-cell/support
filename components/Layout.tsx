import React from 'react';
import { useTickets } from '../context/TicketContext';
import { LogOut, LayoutDashboard, LifeBuoy, ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, logout, login } = useTickets();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.hash = '/';
  };

  const handleLogin = () => {
    const email = prompt("Enter Admin Email Address:");
    if (email) {
      const success = login(email);
      if (!success) {
        alert("Access Denied: You do not have administrator privileges.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                <div className="bg-brand-600 text-white p-1.5 rounded-lg">
                  <ShoppingBag size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">KishanYadav.shop</h1>
                    <p className="text-xs text-gray-500 -mt-1 font-medium">Support Portal</p>
                </div>
              </Link>
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`${location.pathname === '/' ? 'border-brand-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Home
                </Link>
                <Link
                  to="/submit-ticket"
                  className={`${location.pathname === '/submit-ticket' ? 'border-brand-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Submit Request
                </Link>
                <Link
                  to="/check-status"
                  className={`${location.pathname === '/check-status' ? 'border-brand-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Check Status
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/admin"
                    className={`${location.pathname === '/admin' ? 'border-brand-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="ml-4 flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              ) : (
                 <button
                  onClick={handleLogin}
                  className="ml-4 flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Admin Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-500">&copy; 2024 KishanYadav.shop. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
};