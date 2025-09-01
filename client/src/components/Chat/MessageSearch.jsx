import React, { useState, useEffect } from 'react';
import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  BsSearch, 
  BsFilter, 
  BsCalendar, 
  BsPerson, 
  BsFileText,
  BsImage,
  BsCameraVideo,
  BsMic,
  BsLocation,
  BsPersonBadge
} from "react-icons/bs";

const MessageSearch = ({ onClose, onMessageSelect }) => {
  const [{ userInfo, currentChatUser }] = useStateProvider();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    senderId: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const messageTypes = [
    { value: 'all', label: 'All Types', icon: BsFileText },
    { value: 'text', label: 'Text', icon: BsFileText },
    { value: 'image', label: 'Images', icon: BsImage },
    { value: 'video', label: 'Videos', icon: BsCameraVideo },
    { value: 'audio', label: 'Audio', icon: BsMic },
    { value: 'location', label: 'Location', icon: BsLocation },
    { value: 'contact', label: 'Contact', icon: BsPersonBadge },
    { value: 'document', label: 'Documents', icon: BsFileText }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.get('/api/enhanced/messages/search', {
        params: {
          userId: userInfo.id,
          query: searchQuery,
          type: filters.type === 'all' ? undefined : filters.type,
          senderId: filters.senderId || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          limit: 100
        }
      });

      if (response.data.success) {
        setSearchResults(response.data.messages);
        if (response.data.messages.length === 0) {
          toast.info('No messages found');
        }
      }
    } catch (error) {
      toast.error('Search failed');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMessageClick = (message) => {
    if (onMessageSelect) {
      onMessageSelect(message);
    }
    onClose();
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      senderId: '',
      startDate: '',
      endDate: ''
    });
  };

  const getMessagePreview = (message) => {
    switch (message.type) {
      case 'text':
        return message.messages.substring(0, 100) + (message.messages.length > 100 ? '...' : '');
      case 'image':
        return '📷 Image';
      case 'video':
        return '🎥 Video';
      case 'audio':
        return '🎵 Audio Message';
      case 'location':
        return '📍 Location';
      case 'contact':
        return '👤 Contact';
      case 'document':
        return '📄 Document';
      case 'sticker':
        return '😀 Sticker';
      default:
        return message.messages || 'Unknown message type';
    }
  };

  const getMessageIcon = (type) => {
    const messageType = messageTypes.find(t => t.value === type);
    if (messageType) {
      const Icon = messageType.icon;
      return <Icon className="text-lg" />;
    }
    return <BsFileText className="text-lg" />;
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, filters]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-xl flex items-center gap-2">
            <BsSearch />
            Search Messages
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg pl-12"
            />
            <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <BsFilter />
              Filters
            </button>
            {Object.values(filters).some(v => v !== '' && v !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-700 rounded-lg">
              {/* Message Type */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Message Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm"
                >
                  {messageTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sender */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Sender</label>
                <select
                  value={filters.senderId}
                  onChange={(e) => setFilters(prev => ({ ...prev, senderId: e.target.value }))}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm"
                >
                  <option value="">All Senders</option>
                  <option value={userInfo.id}>You</option>
                  <option value={currentChatUser.id}>{currentChatUser.name}</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">From Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">To Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">
              {isSearching ? 'Searching...' : `Results (${searchResults.length})`}
            </h4>
            {searchResults.length > 0 && (
              <button
                onClick={() => setSearchResults([])}
                className="text-gray-400 hover:text-white text-sm"
              >
                Clear Results
              </button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className="p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-gray-400 mt-1">
                      {getMessageIcon(message.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {message.sender.id === userInfo.id ? 'You' : message.sender.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {calculateTime(message.createdAt)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        {getMessagePreview(message)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
            <div className="text-center py-8">
              <BsSearch className="text-4xl text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">No messages found</p>
              <p className="text-gray-500 text-sm">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageSearch;
