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
  login: () => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const addTicket = (ticket: Ticket) => {
    setTickets(prev => [ticket, ...prev]);
    // Simulate notification
    if (ticket.aiPriority === TicketPriority.CRITICAL) {
      // In a real app, this would trigger an email
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

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <TicketContext.Provider value={{ 
      tickets, 
      addTicket, 
      updateTicketStatus, 
      updateTicketDetails,
      deleteTickets,
      isAuthenticated, 
      login, 
      logout 
    }}>
      {children}
    </TicketContext.Provider>
  );
};