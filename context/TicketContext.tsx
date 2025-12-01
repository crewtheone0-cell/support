import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Ticket, TicketStatus, TicketPriority, Sentiment, TicketHistoryItem } from '../types';
import { INITIAL_TICKETS } from '../services/mockData';

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  updateTicketStatus: (id: string, status: TicketStatus, adminName: string) => void;
  updateTicketDetails: (id: string, updates: Partial<Ticket>, adminName: string) => void;
  deleteTickets: (ids: string[]) => void;
  isAuthenticated: boolean;
  currentUser: { email: string; role: 'admin' | 'guest' } | null;
  login: (email: string) => boolean;
  logout: () => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

export const TicketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [currentUser, setCurrentUser] = useState<{ email: string; role: 'admin' | 'guest' } | null>(null);

  const addTicket = (ticket: Ticket) => {
    setTickets(prev => [ticket, ...prev]);
    // Simulate notification
    if (ticket.aiPriority === TicketPriority.CRITICAL) {
      console.log(`[EMAIL ALERT] New CRITICAL ticket from ${ticket.customerName}`);
    }
  };

  const updateTicketStatus = (id: string, status: TicketStatus, adminName: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        const historyItem: TicketHistoryItem = {
          timestamp: new Date().toISOString(),
          action: 'Status Change',
          actor: adminName,
          details: `Changed from ${t.status} to ${status}`
        };

        // Simulate Email Notification on Resolve
        if (status === TicketStatus.RESOLVED && t.status !== TicketStatus.RESOLVED) {
          alert(`[System Notification]\n\nEmail sent to user (${t.email}):\n"Your ticket #${t.id} has been marked as RESOLVED. Please check your dashboard for details."`);
        }

        return { ...t, status, updatedAt: new Date().toISOString(), history: [historyItem, ...t.history] };
      }
      return t;
    }));
  };

  const updateTicketDetails = (id: string, updates: Partial<Ticket>, adminName: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        const historyItem: TicketHistoryItem = {
          timestamp: new Date().toISOString(),
          action: 'Updated Details',
          actor: adminName,
          details: Object.keys(updates).join(', ')
        };
        return { 
          ...t, 
          ...updates, 
          updatedAt: new Date().toISOString(), 
          history: [historyItem, ...t.history] 
        };
      }
      return t;
    }));
  };

  const deleteTickets = (ids: string[]) => {
    setTickets(prev => prev.filter(t => !ids.includes(t.id)));
  };

  const login = (email: string) => {
    // Specific Admin Access Check
    if (email.toLowerCase() === 'kishanyadav@myyahoo.com') {
      setCurrentUser({ email, role: 'admin' });
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const isAuthenticated = currentUser?.role === 'admin';

  return (
    <TicketContext.Provider value={{ 
      tickets, 
      addTicket, 
      updateTicketStatus, 
      updateTicketDetails,
      deleteTickets,
      isAuthenticated, 
      currentUser,
      login, 
      logout 
    }}>
      {children}
    </TicketContext.Provider>
  );
};