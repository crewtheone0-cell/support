import React, { useState, useMemo, useEffect } from 'react';
import { useTickets } from '../context/TicketContext';
import { Ticket, TicketStatus, TicketPriority, Sentiment, TicketHistoryItem } from '../types';
import { 
  Search, Filter, CheckCircle, AlertTriangle, Clock, MoreHorizontal, 
  X, Send, Edit2, Archive, User, Tag, ArrowUpDown, ChevronDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Helper Components ---

const Badge: React.FC<{ children: React.ReactNode, color: string }> = ({ children, color }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
    {children}
  </span>
);

const getStatusColor = (status: TicketStatus) => {
  switch(status) {
    case TicketStatus.OPEN: return 'bg-yellow-100 text-yellow-800';
    case TicketStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
    case TicketStatus.RESOLVED: return 'bg-green-100 text-green-800';
    case TicketStatus.CLOSED: return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: TicketPriority) => {
  switch(priority) {
    case TicketPriority.CRITICAL: return 'bg-red-100 text-red-800 border border-red-200';
    case TicketPriority.HIGH: return 'bg-orange-100 text-orange-800';
    case TicketPriority.MEDIUM: return 'bg-blue-100 text-blue-800';
    case TicketPriority.LOW: return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getSentimentColor = (sentiment: Sentiment) => {
   switch(sentiment) {
    case Sentiment.POSITIVE: return 'text-green-600 bg-green-50';
    case Sentiment.NEUTRAL: return 'text-gray-600 bg-gray-50';
    case Sentiment.NEGATIVE: return 'text-orange-600 bg-orange-50';
    case Sentiment.ANGRY: return 'text-red-600 bg-red-50';
    default: return 'text-gray-600';
  }
};

// --- Main Component ---

const AdminDashboard: React.FC = () => {
  const { tickets, updateTicketStatus, updateTicketDetails, deleteTickets } = useTickets();
  
  // State for Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>('ALL');
  const [sentimentFilter, setSentimentFilter] = useState<Sentiment | 'ALL'>('ALL');

  // State for Sorting
  const [sortConfig, setSortConfig] = useState<{ key: keyof Ticket | 'aiPriority' | 'customerName', direction: 'asc' | 'desc' } | null>(null);

  // State for Selection
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());

  // State for Modal
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [responseDraft, setResponseDraft] = useState('');
  const [isEditingResponse, setIsEditingResponse] = useState(false);

  // --- Derived Data ---

  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.customerName.toLowerCase().includes(lower) || 
        t.email.toLowerCase().includes(lower) ||
        t.subject.toLowerCase().includes(lower)
      );
    }
    if (statusFilter !== 'ALL') result = result.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'ALL') result = result.filter(t => (t.manualPriority || t.aiPriority) === priorityFilter);
    if (sentimentFilter !== 'ALL') result = result.filter(t => (t.manualSentiment || t.aiSentiment) === sentimentFilter);

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key] ?? '';
        const valB = b[sortConfig.key] ?? '';
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [tickets, searchTerm, statusFilter, priorityFilter, sentimentFilter, sortConfig]);

  // Counts for Filter Dropdowns
  const counts = useMemo(() => {
      const statusCounts = tickets.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {} as Record<string, number>);
      return { status: statusCounts };
  }, [tickets]);

  // --- Handlers ---

  const handleSort = (key: keyof Ticket) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedTicketIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedTicketIds(newSet);
  };

  const handleBulkAction = (action: 'resolve' | 'delete') => {
    if (action === 'resolve') {
      selectedTicketIds.forEach(id => updateTicketStatus(id, TicketStatus.RESOLVED, 'Admin'));
    } else if (action === 'delete') {
      deleteTickets(Array.from(selectedTicketIds));
    }
    setSelectedTicketIds(new Set());
  };

  const openTicketModal = (ticket: Ticket) => {
    setActiveTicket(ticket);
    setResponseDraft(ticket.aiSuggestedResponse);
    setIsEditingResponse(false);
  };

  const handleSendResponse = () => {
    if (!activeTicket) return;
    
    // Simulate updating ticket with response sent action
    updateTicketDetails(
      activeTicket.id, 
      { status: TicketStatus.RESOLVED }, // Auto-resolve on response? Or keep previous. Let's resolve.
      'Admin'
    );
    
    // We also want to explicitly log the email content sent
    // We reuse updateTicketDetails just to trigger the history mechanism, 
    // but in a real app this would be a separate "Add Note/Email" function.
    // For now, let's just use the fact that updateTicketDetails adds history.
    
    alert(`[Simulated] Email sent to ${activeTicket.email}:\n\n"${responseDraft}"`);
    
    // Refetch/Update active ticket to show new history immediately is handled by local state trick or useEffect
    // But since tickets comes from context, activeTicket needs to be synced if we want to see the history immediately in modal
    // We'll close modal for simplicity or rely on the sync.
    
    setActiveTicket(null);
  };
  
  const handleUpdateActiveTicketDetails = (updates: Partial<Ticket>) => {
      if(!activeTicket) return;
      updateTicketDetails(activeTicket.id, updates, 'Admin');
      // Update local active ticket state immediately to reflect in modal
      setActiveTicket(prev => prev ? ({...prev, ...updates}) : null);
  };

  // --- Chart Data ---
  const chartData = [
    { name: 'Open', value: tickets.filter(t => t.status === TicketStatus.OPEN).length, color: '#fbbf24' },
    { name: 'In Prog', value: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length, color: '#60a5fa' },
    { name: 'Resolved', value: tickets.filter(t => t.status === TicketStatus.RESOLVED).length, color: '#34d399' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Total Tickets</h3>
            <p className="text-3xl font-bold text-gray-900">{tickets.length}</p>
        </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Open Issues</h3>
            <p className="text-3xl font-bold text-yellow-600">{tickets.filter(t => t.status === TicketStatus.OPEN).length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Critical Priority</h3>
            <p className="text-3xl font-bold text-red-600">{tickets.filter(t => t.aiPriority === TicketPriority.CRITICAL).length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-32">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis dataKey="name" hide />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            placeholder="Search tickets, customers, or emails"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select 
            className="block w-full md:w-auto pl-3 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-lg border"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">All Status</option>
            {Object.values(TicketStatus).map(s => (
                <option key={s} value={s}>{s} ({counts.status[s] || 0})</option>
            ))}
          </select>

          <select 
            className="block w-full md:w-auto pl-3 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-lg border"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
          >
            <option value="ALL">All Priorities</option>
            {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>

           <select 
            className="block w-full md:w-auto pl-3 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-lg border"
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value as any)}
          >
            <option value="ALL">All Sentiments</option>
            {Object.values(Sentiment).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk Actions Banner */}
      {selectedTicketIds.size > 0 && (
        <div className="bg-brand-50 border border-brand-200 p-4 rounded-xl flex items-center justify-between">
          <span className="text-brand-800 font-medium">{selectedTicketIds.size} tickets selected</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkAction('resolve')} className="px-3 py-1 bg-white text-brand-700 border border-brand-200 rounded-md hover:bg-brand-50 text-sm font-medium">Mark Resolved</button>
            <button onClick={() => handleBulkAction('delete')} className="px-3 py-1 bg-white text-red-700 border border-red-200 rounded-md hover:bg-red-50 text-sm font-medium">Delete</button>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500" 
                    onChange={(e) => {
                        if (e.target.checked) setSelectedTicketIds(new Set(filteredTickets.map(t => t.id)));
                        else setSelectedTicketIds(new Set());
                    }}
                  />
                </th>
                <th scope="col" onClick={() => handleSort('customerName')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  <div className="flex items-center">Customer <ArrowUpDown size={14} className="ml-1" /></div>
                </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Summary
                </th>
                <th scope="col" onClick={() => handleSort('status')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Status
                </th>
                <th scope="col" onClick={() => handleSort('aiPriority')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                   Priority
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sentiment
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                     <input 
                        type="checkbox" 
                        className="rounded text-brand-600 focus:ring-brand-500" 
                        checked={selectedTicketIds.has(ticket.id)}
                        onChange={() => toggleSelection(ticket.id)}
                     />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                        {ticket.customerName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{ticket.customerName}</div>
                        <div className="text-sm text-gray-500">{ticket.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">{ticket.subject}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{ticket.aiSummary}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative inline-block text-left">
                       <select 
                          value={ticket.status} 
                          onChange={(e) => updateTicketStatus(ticket.id, e.target.value as TicketStatus, 'Admin')}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-offset-1 focus:ring-brand-500 cursor-pointer ${getStatusColor(ticket.status)}`}
                        >
                            {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color={getPriorityColor(ticket.manualPriority || ticket.aiPriority)}>
                        {ticket.manualPriority || ticket.aiPriority}
                    </Badge>
                     {ticket.manualPriority && <span className="ml-1 text-xs text-gray-400">(Manual)</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`text-sm font-medium ${getSentimentColor(ticket.manualSentiment || ticket.aiSentiment)}`}>
                        {ticket.manualSentiment || ticket.aiSentiment}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openTicketModal(ticket)} className="text-brand-600 hover:text-brand-900 bg-brand-50 px-3 py-1.5 rounded-md hover:bg-brand-100 transition">
                      View & Respond
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setActiveTicket(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                
                {/* Modal Header */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                            Ticket #{activeTicket.id} - {activeTicket.subject}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            From {activeTicket.customerName} &lt;{activeTicket.email}&gt; via Order {activeTicket.orderId}
                        </p>
                    </div>
                    <button onClick={() => setActiveTicket(null)} className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
                        <X size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Col: Details & AI */}
                    <div className="md:col-span-2 space-y-6">
                         {/* Description */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h4>
                            <p className="text-gray-900 text-sm whitespace-pre-wrap">{activeTicket.description}</p>
                        </div>

                        {/* AI Response Section */}
                        <div className="bg-brand-50 border border-brand-100 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="flex items-center text-sm font-bold text-brand-900">
                                    <Send size={14} className="mr-2" /> AI Suggested Response
                                </h4>
                                {!isEditingResponse ? (
                                     <button onClick={() => setIsEditingResponse(true)} className="text-xs text-brand-600 hover:text-brand-800 flex items-center">
                                        <Edit2 size={12} className="mr-1" /> Edit
                                     </button>
                                ) : (
                                     <button onClick={() => setResponseDraft(activeTicket.aiSuggestedResponse)} className="text-xs text-red-600 hover:text-red-800">
                                        Reset
                                     </button>
                                )}
                            </div>
                            {isEditingResponse ? (
                                <textarea 
                                    value={responseDraft}
                                    onChange={(e) => setResponseDraft(e.target.value)}
                                    rows={6}
                                    className="w-full p-2 border border-brand-200 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500"
                                />
                            ) : (
                                <p className="text-gray-700 text-sm italic border-l-4 border-brand-300 pl-3 py-1">
                                    "{responseDraft}"
                                </p>
                            )}
                            <div className="mt-3 flex justify-end">
                                <button onClick={handleSendResponse} className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-700 transition flex items-center shadow-sm">
                                    <Send size={16} className="mr-2" /> Send Response (Email)
                                </button>
                            </div>
                        </div>

                        {/* Ticket History */}
                        <div>
                             <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center"><Clock size={16} className="mr-2"/> Activity History</h4>
                             <ul className="border-l-2 border-gray-200 ml-2 pl-4 space-y-4">
                                {activeTicket.history.map((h, i) => (
                                    <li key={i} className="relative">
                                        <div className="absolute -left-[21px] bg-gray-200 h-2.5 w-2.5 rounded-full border-2 border-white"></div>
                                        <p className="text-sm text-gray-800"><span className="font-semibold">{h.action}</span> by {h.actor}</p>
                                        <p className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString()} {h.details && `- ${h.details}`}</p>
                                    </li>
                                ))}
                             </ul>
                        </div>
                    </div>

                    {/* Right Col: Metadata & Overrides */}
                    <div className="space-y-6">
                        {/* Overrides */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                             <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Metadata Override</h4>
                             
                             <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                                <select 
                                    className="block w-full text-sm border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                                    value={activeTicket.manualPriority || activeTicket.aiPriority}
                                    onChange={(e) => handleUpdateActiveTicketDetails({ manualPriority: e.target.value as TicketPriority })}
                                >
                                    {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                             </div>

                             <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Sentiment</label>
                                <select 
                                    className="block w-full text-sm border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                                    value={activeTicket.manualSentiment || activeTicket.aiSentiment}
                                    onChange={(e) => handleUpdateActiveTicketDetails({ manualSentiment: e.target.value as Sentiment })}
                                >
                                    {Object.values(Sentiment).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                             </div>
                             
                             <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Tags</label>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {activeTicket.tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            {tag}
                                            <button onClick={() => handleUpdateActiveTicketDetails({ tags: activeTicket.tags.filter(t => t !== tag) })} className="ml-1 text-gray-400 hover:text-gray-600"><X size={10}/></button>
                                        </span>
                                    ))}
                                </div>
                                <input 
                                    type="text" 
                                    className="block w-full text-xs border-gray-300 rounded-md" 
                                    placeholder="Add tag + Enter"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = e.currentTarget.value.trim();
                                            if (val && !activeTicket.tags.includes(val)) {
                                                handleUpdateActiveTicketDetails({ tags: [...activeTicket.tags, val] });
                                                e.currentTarget.value = '';
                                            }
                                        }
                                    }}
                                />
                             </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                             <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Customer Context</h4>
                             <div className="flex items-center mb-3">
                                 <div className="bg-gray-100 p-2 rounded-full mr-3"><User size={16}/></div>
                                 <div>
                                     <p className="text-sm font-medium">{activeTicket.customerName}</p>
                                     <p className="text-xs text-gray-500">History: 3 previous orders</p>
                                 </div>
                             </div>
                             <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                 <span className="font-semibold block mb-1">Order #{activeTicket.orderId}</span>
                                 Looking up order details... (Simulated)
                             </div>
                        </div>
                    </div>
                </div>

              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                    type="button" 
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setActiveTicket(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;