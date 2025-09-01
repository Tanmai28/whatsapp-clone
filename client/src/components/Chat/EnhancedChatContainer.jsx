import React, { useState, useEffect, useRef } from 'react';
import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import EnhancedMessage from "./EnhancedMessage";
import EnhancedMessageBar from "./EnhancedMessageBar";
import ChatHeader from "./ChatHeader";
import MessageSearch from "./MessageSearch";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  BsSearch, 
  BsThreeDotsVertical, 
  BsArchive, 
  BsMute, 
  BsBlock, 
  BsPin,
  BsForward,
  BsReply,
  BsTrash,
  BsEmojiSmile,
  BsFileEarmark,
  BsLocation,
  BsPerson,
  BsCameraVideo,
  BsMic,
  BsPhone,
  BsPhoneFill
} from "react-icons/bs";
import { MdLocationOn, MdContactPhone, MdVideoCall, MdCall } from "react-icons/md";

const EnhancedChatContainer = () => {
  const [{ messages, currentChatUser, userInfo, socket }] = useStateProvider();
  const [replyMessage, setReplyMessage] = useState(null);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [isArchived, setIsArchived] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef(null);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if chat is archived or muted
    checkChatStatus();
    // Load pinned messages
    loadPinnedMessages();
  }, [currentChatUser]);

  const checkChatStatus = async () => {
    try {
      const [archiveRes, muteRes, blockRes] = await Promise.all([
        axios.get(`/api/enhanced/chats/archive/check`, {
          params: { userId: userInfo.id, chatUserId: currentChatUser.id }
        }).catch(() => ({ data: { isArchived: false } })),
        axios.get(`/api/enhanced/chats/mute/check`, {
          params: { userId: userInfo.id, chatUserId: currentChatUser.id }
        }).catch(() => ({ data: { isMuted: false } })),
        axios.get(`/api/enhanced/users/block/check`, {
          params: { userId: userInfo.id, blockedUserId: currentChatUser.id }
        }).catch(() => ({ data: { isBlocked: false } }))
      ]);

      setIsArchived(archiveRes.data.isArchived);
      setIsMuted(muteRes.data.isMuted);
      setIsBlocked(blockRes.data.isBlocked);
    } catch (error) {
      console.error('Error checking chat status:', error);
    }
  };

  const loadPinnedMessages = async () => {
    try {
      const response = await axios.get(`/api/enhanced/messages/pinned`, {
        params: { chatUserId: currentChatUser.id }
      });
      setPinnedMessages(response.data.pinnedMessages || []);
    } catch (error) {
      console.error('Error loading pinned messages:', error);
    }
  };

  const handleReply = (message) => {
    setReplyMessage(message);
    setForwardMessage(null);
  };

  const handleForward = (message) => {
    setForwardMessage(message);
    setReplyMessage(null);
  };

  const handleDelete = async (messageId) => {
    try {
      await axios.delete(`/api/enhanced/messages/${messageId}`, {
        data: { userId: userInfo.id }
      });
      toast.success('Message deleted');
      // Update local state or trigger refresh
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handlePin = async (message) => {
    try {
      await axios.post(`/api/enhanced/messages/${message.id}/pin`, {
        userId: userInfo.id
      });
      toast.success('Message pinned');
      loadPinnedMessages();
    } catch (error) {
      toast.error('Failed to pin message');
    }
  };

  const handleReaction = async (messageId, reaction) => {
    try {
      await axios.post('/api/enhanced/reactions', {
        messageId,
        userId: userInfo.id,
        reaction
      });
      toast.success('Reaction added');
      // Update local state or trigger refresh
    } catch (error) {
      toast.error('Failed to add reaction');
    }
  };

  const handleArchive = async () => {
    try {
      if (isArchived) {
        await axios.delete(`/api/enhanced/chats/archive/${currentChatUser.id}`, {
          data: { userId: userInfo.id }
        });
        setIsArchived(false);
        toast.success('Chat unarchived');
      } else {
        await axios.post('/api/enhanced/chats/archive', {
          userId: userInfo.id,
          chatUserId: currentChatUser.id
        });
        setIsArchived(true);
        toast.success('Chat archived');
      }
    } catch (error) {
      toast.error('Failed to update archive status');
    }
  };

  const handleMute = async () => {
    try {
      if (isMuted) {
        await axios.delete(`/api/enhanced/chats/mute/${currentChatUser.id}`, {
          data: { userId: userInfo.id }
        });
        setIsMuted(false);
        toast.success('Chat unmuted');
      } else {
        await axios.post('/api/enhanced/chats/mute', {
          userId: userInfo.id,
          chatUserId: currentChatUser.id,
          isPermanentlyMuted: true
        });
        setIsMuted(true);
        toast.success('Chat muted');
      }
    } catch (error) {
      toast.error('Failed to update mute status');
    }
  };

  const handleBlock = async () => {
    try {
      if (isBlocked) {
        await axios.delete(`/api/enhanced/users/block/${currentChatUser.id}`, {
          data: { userId: userInfo.id }
        });
        setIsBlocked(false);
        toast.success('User unblocked');
      } else {
        await axios.post('/api/enhanced/users/block', {
          userId: userInfo.id,
          blockedUserId: currentChatUser.id
        });
        setIsBlocked(true);
        toast.success('User blocked');
      }
    } catch (error) {
      toast.error('Failed to update block status');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await axios.get('/api/enhanced/messages/search', {
        params: {
          userId: userInfo.id,
          query: searchQuery,
          chatUserId: currentChatUser.id
        }
      });
      setSearchResults(response.data.messages);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleExport = async (format = 'json') => {
    if (!isClient) return;
    
    try {
      const response = await axios.get(`/api/enhanced/chats/${currentChatUser.id}/export`, {
        params: { userId: userInfo.id, format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `chat-history-${currentChatUser.name}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const dataStr = JSON.stringify(response.data.messages, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `chat-history-${currentChatUser.name}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      
      toast.success('Chat history exported');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleCall = (type) => {
    if (type === 'voice') {
      socket.emit("outgoing-voice-call", {
        to: currentChatUser.id,
        from: userInfo.id,
        roomId: Math.random().toString(36).substr(2, 9),
        callType: "voice"
      });
    } else if (type === 'video') {
      socket.emit("outgoing-video-call", {
        to: currentChatUser.id,
        from: userInfo.id,
        roomId: Math.random().toString(36).substr(2, 9),
        callType: "video"
      });
    }
  };

  const handleMessageSelect = (message) => {
    if (!isClient) return;
    
    // Scroll to the selected message
    const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message temporarily
      messageElement.classList.add('bg-yellow-500', 'bg-opacity-20');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-500', 'bg-opacity-20');
      }, 3000);
    }
  };

  const renderPinnedMessages = () => {
    if (pinnedMessages.length === 0) return null;
    
    return (
      <div className="bg-yellow-900 bg-opacity-20 border-l-4 border-yellow-400 p-3 mb-4 mx-4 rounded">
        <div className="flex items-center gap-2 mb-2">
          <BsPin className="text-yellow-400" />
          <span className="text-sm font-medium text-yellow-200">Pinned Messages</span>
        </div>
        {pinnedMessages.slice(0, 3).map((pinned, index) => (
          <div key={index} className="text-xs text-gray-300 mb-1">
            {pinned.message.messages.substring(0, 50)}...
          </div>
        ))}
      </div>
    );
  };

  const renderSearchResults = () => {
    if (searchResults.length === 0) return null;
    
    return (
      <div className="bg-blue-900 bg-opacity-20 border-l-4 border-blue-400 p-3 mb-4 mx-4 rounded">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-200">Search Results</span>
          <button
            onClick={() => setSearchResults([])}
            className="text-xs text-blue-300 hover:text-blue-100"
          >
            Clear
          </button>
        </div>
        {searchResults.slice(0, 3).map((result, index) => (
          <div key={index} className="text-xs text-gray-300 mb-1">
            {result.messages.substring(0, 50)}...
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <ChatHeader 
        currentChatUser={currentChatUser}
        onSearch={() => setShowMessageSearch(true)}
        onOptions={() => setShowOptions(!showOptions)}
        isArchived={isArchived}
        isMuted={isMuted}
        isBlocked={isBlocked}
      />

      {/* Search Bar */}
      {showSearch && (
        <div className="bg-gray-800 p-3 border-b border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-gray-700 text-white px-3 py-2 rounded"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>
      )}

      {/* Options Menu */}
      {showOptions && (
        <div className="bg-gray-800 p-3 border-b border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleArchive}
              className={`flex items-center gap-2 p-2 rounded ${
                isArchived ? 'bg-green-600' : 'bg-gray-700'
              } hover:bg-opacity-80`}
            >
              <BsArchive />
              {isArchived ? 'Unarchive' : 'Archive'}
            </button>
            <button
              onClick={handleMute}
              className={`flex items-center gap-2 p-2 rounded ${
                isMuted ? 'bg-green-600' : 'bg-gray-700'
              } hover:bg-opacity-80`}
            >
              <BsMute />
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button
              onClick={handleBlock}
              className={`flex items-center gap-2 p-2 rounded ${
                isBlocked ? 'bg-green-600' : 'bg-gray-700'
              } hover:bg-opacity-80`}
            >
              <BsBlock />
              {isBlocked ? 'Unblock' : 'Block'}
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-2 p-2 rounded bg-gray-700 hover:bg-opacity-80"
            >
              <BsFileEarmark />
              Export
            </button>
          </div>
        </div>
      )}

      {/* Pinned Messages */}
      {renderPinnedMessages()}

      {/* Search Results */}
      {renderSearchResults()}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-2">
          {messages.map((message, index) => (
            <div key={message.id} data-message-id={message.id}>
              <EnhancedMessage
                message={message}
                onReply={handleReply}
                onForward={handleForward}
                onDelete={handleDelete}
                onPin={handlePin}
                onReact={handleReaction}
              />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Reply Preview */}
      {replyMessage && (
        <div className="bg-gray-800 p-3 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">Replying to {replyMessage.senderId === userInfo.id ? 'yourself' : currentChatUser.name}</div>
              <div className="text-sm text-gray-300 truncate">{replyMessage.messages}</div>
            </div>
            <button
              onClick={() => setReplyMessage(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Forward Preview */}
      {forwardMessage && (
        <div className="bg-gray-800 p-3 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">Forwarding message</div>
              <div className="text-sm text-gray-300 truncate">{forwardMessage.messages}</div>
            </div>
            <button
              onClick={() => setForwardMessage(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Message Bar */}
      <EnhancedMessageBar
        replyMessage={replyMessage}
        forwardMessage={forwardMessage}
        onClearReply={() => setReplyMessage(null)}
        onClearForward={() => setForwardMessage(null)}
      />

      {/* Call Buttons */}
      <div className="bg-gray-800 p-3 border-t border-gray-700">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleCall('voice')}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700"
          >
            <BsPhone />
            Voice Call
          </button>
          <button
            onClick={() => handleCall('video')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
          >
            <BsCameraVideo />
            Video Call
          </button>
        </div>
      </div>

      {/* Message Search Modal */}
      {showMessageSearch && (
        <MessageSearch
          onClose={() => setShowMessageSearch(false)}
          onMessageSelect={handleMessageSelect}
        />
      )}
    </div>
  );
};

export default EnhancedChatContainer;
