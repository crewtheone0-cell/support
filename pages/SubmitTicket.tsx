import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../context/TicketContext';
import { analyzeComplaint } from '../services/geminiService';
import { Ticket, TicketStatus, TicketHistoryItem } from '../types';
import { Send, Loader2, Paperclip, AlertCircle } from 'lucide-react';

const SubmitTicket: React.FC = () => {
  const navigate = useNavigate();
  const { addTicket } = useTickets();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderId: '',
    subject: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Analyze with AI
      const analysis = await analyzeComplaint(formData.subject, formData.description, formData.orderId);

      // 2. Create Ticket Object
      const newTicket: Ticket = {
        id: `T-${Math.floor(Math.random() * 10000)}`,
        customerName: formData.name,
        email: formData.email,
        orderId: formData.orderId,
        subject: formData.subject,
        description: formData.description,
        status: TicketStatus.OPEN,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiPriority: analysis.priority,
        aiSentiment: analysis.sentiment,
        aiSummary: analysis.summary,
        aiSuggestedResponse: analysis.suggestedResponse,
        history: [{
          timestamp: new Date().toISOString(),
          action: 'Ticket Created',
          actor: 'System',
          details: 'Submitted via Web Portal'
        }],
        tags: []
      };

      // 3. Save to Global State
      addTicket(newTicket);

      // 4. Navigate to success (or home)
      alert(`Ticket #${newTicket.id} submitted successfully!`);
      navigate('/');
    } catch (error) {
      console.error("Submission error", error);
      alert("Failed to submit ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-brand-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">Submit a Complaint</h2>
          <p className="text-brand-100 mt-2">Tell us about your issue and we'll fix it.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
             <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
             <div className="relative">
                <input
                    type="text"
                    id="orderId"
                    name="orderId"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., ORD-1001"
                    value={formData.orderId}
                    onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <span className="text-xs">Required</span>
                </div>
             </div>
             <p className="mt-1 text-xs text-gray-500">Found in your confirmation email.</p>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
              placeholder="Brief summary of the issue"
              value={formData.subject}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
              placeholder="Please provide as much detail as possible..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Optional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition cursor-pointer">
                <div className="space-y-1 text-center">
                  <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white ${loading ? 'bg-brand-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'} shadow-md hover:shadow-lg transition-all`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Analyzing...
                </>
              ) : (
                <>
                  Submit Ticket
                  <Send className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitTicket;