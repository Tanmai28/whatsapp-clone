import React, { useState, useEffect } from 'react';
import { useStateProvider } from "@/context/StateContext";
import { BsTelephone, BsTelephoneFill, BsTelephoneX } from "react-icons/bs";
import { MdVideoCall, MdVideoCallOff, MdCallMissed, MdCallReceived, MdCallMade } from "react-icons/md";
import { FaPhone, FaPhoneSlash } from "react-icons/fa";

const CallHistory = ({ onClose, onCallUser }) => {
  const [{ userInfo }] = useStateProvider();
  const [callHistory, setCallHistory] = useState([]);
  const [filterType, setFilterType] = useState('all'); // all, missed, outgoing, incoming
  const [searchQuery, setSearchQuery] = useState('');

  // Mock call history data - replace with actual API call
  useEffect(() => {
    const mockCallHistory = [
      {
        id: 1,
        type: 'voice',
        status: 'completed',
        duration: 180, // seconds
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        contact: {
          id: 2,
          name: 'John Doe',
          profilePicture: '',
          phone: '+1234567890'
        },
        direction: 'outgoing'
      },
      {
        id: 2,
        type: 'video',
        status: 'missed',
        duration: 0,
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        contact: {
          id: 3,
          name: 'Jane Smith',
          profilePicture: '',
          phone: '+1234567891'
        },
        direction: 'incoming'
      },
      {
        id: 3,
        type: 'voice',
        status: 'completed',
        duration: 45,
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        contact: {
          id: 4,
          name: 'Mike Johnson',
          profilePicture: '',
          phone: '+1234567892'
        },
        direction: 'incoming'
      },
      {
        id: 4,
        type: 'video',
        status: 'rejected',
        duration: 0,
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        contact: {
          id: 5,
          name: 'Sarah Wilson',
          profilePicture: '',
          phone: '+1234567893'
        },
        direction: 'outgoing'
      }
    ];
    
    setCallHistory(mockCallHistory);
  }, []);

  const formatDuration = (seconds) => {
    if (seconds === 0) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getCallIcon = (call) => {
    const { type, status, direction } = call;
    
    if (status === 'missed') {
      return type === 'video' ? <MdVideoCallOff className="text-red-500" /> : <BsTelephoneX className="text-red-500" />;
    }
    
    if (status === 'rejected') {
      return type === 'video' ? <MdVideoCallOff className="text-orange-500" /> : <FaPhoneSlash className="text-orange-500" />;
    }
    
    if (status === 'completed') {
      if (direction === 'outgoing') {
        return type === 'video' ? <MdVideoCall className="text-green-500" /> : <FaPhone className="text-green-500" />;
      } else {
        return type === 'video' ? <MdVideoCall className="text-blue-500" /> : <BsTelephone className="text-blue-500" />;
      }
    }
    
    return type === 'video' ? <MdVideoCall className="text-gray-500" /> : <BsTelephone className="text-gray-500" />;
  };

  const getCallStatusText = (call) => {
    const { status, direction } = call;
    
    switch (status) {
      case 'completed':
        return direction === 'outgoing' ? 'Outgoing' : 'Incoming';
      case 'missed':
        return 'Missed';
      case 'rejected':
        return 'Rejected';
      case 'ongoing':
        return 'Ongoing';
      default:
        return status;
    }
  };

  const getCallStatusColor = (call) => {
    const { status } = call;
    
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'missed':
        return 'text-red-500';
      case 'rejected':
        return 'text-orange-500';
      case 'ongoing':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredCallHistory = callHistory.filter(call => {
    const matchesFilter = filterType === 'all' || 
      (filterType === 'missed' && call.status === 'missed') ||
      (filterType === 'outgoing' && call.direction === 'outgoing') ||
      (filterType === 'incoming' && call.direction === 'incoming');
    
    const matchesSearch = call.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         call.contact.phone.includes(searchQuery);
    
    return matchesFilter && matchesSearch;
  });

  const handleCallUser = (contact, type) => {
    onCallUser(contact, type);
    onClose();
  };

  const clearCallHistory = () => {
    if (window.confirm('Are you sure you want to clear all call history?')) {
      setCallHistory([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-panel-header-background rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Call History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded text-white placeholder-gray-400"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 bg-gray-700 p-1 rounded">
            {[
              { id: 'all', label: 'All' },
              { id: 'missed', label: 'Missed' },
              { id: 'outgoing', label: 'Outgoing' },
              { id: 'incoming', label: 'Incoming' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`flex-1 px-4 py-2 rounded text-sm transition-colors ${
                  filterType === filter.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Clear History Button */}
          <div className="flex justify-end">
            <button
              onClick={clearCallHistory}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-white text-sm"
            >
              Clear History
            </button>
          </div>
        </div>

        {/* Call History List */}
        <div className="space-y-3">
          {filteredCallHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No calls found</p>
            </div>
          ) : (
            filteredCallHistory.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                {/* Contact Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                    {call.contact.profilePicture ? (
                      <img src={call.contact.profilePicture} alt="Profile" className="w-full h-full rounded-full" />
                    ) : (
                      <span className="text-lg text-white">{call.contact.name.charAt(0)}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{call.contact.name}</h3>
                      {getCallIcon(call)}
                    </div>
                    <p className="text-sm text-gray-400">{call.contact.phone}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={getCallStatusColor(call)}>
                        {getCallStatusText(call)}
                      </span>
                      {call.duration > 0 && (
                        <span className="text-gray-500">
                          • {formatDuration(call.duration)}
                        </span>
                      )}
                      <span className="text-gray-500">
                        • {formatTimestamp(call.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Call Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCallUser(call.contact, 'voice')}
                    className="p-2 bg-green-600 rounded hover:bg-green-700"
                    title="Voice Call"
                  >
                    <BsTelephone className="text-white" />
                  </button>
                  
                  <button
                    onClick={() => handleCallUser(call.contact, 'video')}
                    className="p-2 bg-blue-600 rounded hover:bg-blue-700"
                    title="Video Call"
                  >
                    <MdVideoCall className="text-white" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredCallHistory.length > 0 && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Total calls: {filteredCallHistory.length}</span>
              <span>
                {filteredCallHistory.filter(c => c.status === 'completed').length} completed
              </span>
              <span>
                {filteredCallHistory.filter(c => c.status === 'missed').length} missed
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallHistory;
