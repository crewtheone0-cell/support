import React from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, Search, FileText, ArrowRight, ShieldCheck, Zap, MessageSquare } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <div className="text-center py-16 px-4 sm:px-6 lg:px-8 max-w-4xl">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 mb-6">
            <Zap className="w-3 h-3 mr-1" /> AI-Powered Support
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          How can we help you today?
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
          Welcome to the KishanYadav.shop support center. Search our knowledge base or submit a ticket to our AI-enhanced support team for rapid resolution.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/submit-ticket"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 md:py-4 md:text-lg md:px-10 transition-all shadow-lg shadow-brand-500/30"
          >
            Submit a Complaint
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            to="/check-status"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all"
          >
            Check Status
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 w-full max-w-6xl px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Protection</h3>
          <p className="text-gray-500">Every purchase is secured. Raise an issue with your Order ID and we'll resolve it instantly.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
          <p className="text-gray-500">Our intelligent system prioritizes your requests to ensure urgent matters are handled first.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Response</h3>
          <p className="text-gray-500">Submit tickets anytime. Our dedicated team reviews and responds around the clock.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;