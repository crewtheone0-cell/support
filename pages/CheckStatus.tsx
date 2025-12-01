import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { Ticket, TicketStatus } from '../types';
import { Search, ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';

const CheckStatus: React.FC = () => {
  const { tickets } = useTickets();
  const [email, setEmail] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const found = tickets.filter(t => t.email.toLowerCase() === email.toLowerCase());
    setUserTickets(found);
    setHasSearched(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedTicketId(expandedTicketId === id ? null : id);
  };

  const getStatusColor = (status: TicketStatus) => {
    switch(status) {
      case TicketStatus.OPEN: return 'bg-yellow-100 text-yellow-800';
      case TicketStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
      case TicketStatus.RESOLVED: return 'bg-green-100 text-green-800';
      case TicketStatus.CLOSED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-8 border-b border-gray-200 bg-brand-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Ticket Status</h2>
          <p className="text-gray-600">Enter your email address to view the history and status of your submitted complaints.</p>
          
          <form onSubmit={handleSearch} className="mt-6 flex gap-3 max-w-lg">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 shadow-sm"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {hasSearched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Found {userTickets.length} ticket{userTickets.length !== 1 ? 's' : ''} for <span className="text-brand-600">{email}</span>
            </h3>
          </div>

          {userTickets.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
              <p className="mt-1 text-sm text-gray-500">We couldn't find any tickets associated with this email address.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white shadow rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition">
                  <div 
                    className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => toggleExpand(ticket.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-brand-600 truncate">Ticket #{ticket.id}</p>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)} md:hidden`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-lg font-medium text-gray-900 truncate">{ticket.subject}</p>
                      <p className="text-sm text-gray-500">
                        Submitted on {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="hidden md:flex items-center ml-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)} mr-4`}>
                        {ticket.status}
                      </span>
                      {expandedTicketId === ticket.id ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>

                  {expandedTicketId === ticket.id && (
                    <div className="bg-gray-50 border-t border-gray-100 px-6 py-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Details</h4>
                          <div className="bg-white p-4 rounded-md border border-gray-200 mb-4">
                             <p className="text-sm text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600">
                             <div><span className="font-semibold">Order ID:</span> {ticket.orderId}</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center">
                            <Clock className="w-4 h-4 mr-1" /> History & Updates
                          </h4>
                          <ul className="space-y-4">
                            {ticket.history.map((h, i) => (
                              <li key={i} className="relative pl-4 border-l-2 border-brand-200">
                                <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-brand-400"></div>
                                <p className="text-sm font-semibold text-gray-900">{h.action}</p>
                                <p className="text-xs text-gray-500 mb-1">{new Date(h.timestamp).toLocaleString()}</p>
                                {h.details && <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-100">{h.details}</p>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckStatus;