import React, { useState, useEffect, useRef } from 'react';
import { useStateProvider } from "@/context/StateContext";
import { BsCamera, BsEmojiSmile, BsTextLeft, BsX, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";

const StatusStories = ({ onClose }) => {
  const [{ userInfo }] = useStateProvider();
  const [activeTab, setActiveTab] = useState('myStatus'); // myStatus, recentUpdates
  const [showCreateStatus, setShowCreateStatus] = useState(false);
  const [statusType, setStatusType] = useState('text'); // text, image, video
  const [statusText, setStatusText] = useState('');
  const [statusImage, setStatusImage] = useState(null);
  const [statusVideo, setStatusVideo] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const textAreaRef = useRef(null);

  // Mock status data - replace with actual API calls
  const [myStatuses, setMyStatuses] = useState([
    {
      id: 1,
      type: 'text',
      content: 'Having a great day! 😊',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      views: 12,
      expiresAt: new Date(Date.now() + 23 * 3600000) // 23 hours left
    },
    {
      id: 2,
      type: 'image',
      content: '/api/status-image-1.jpg',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      views: 8,
      expiresAt: new Date(Date.now() + 22 * 3600000) // 22 hours left
    }
  ]);

  const [recentUpdates, setRecentUpdates] = useState([
    {
      id: 3,
      userId: 2,
      userName: 'John Doe',
      userProfile: '',
      type: 'text',
      content: 'Working on something exciting! 🚀',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      expiresAt: new Date(Date.now() + 23.5 * 3600000)
    },
    {
      id: 4,
      userId: 3,
      userName: 'Jane Smith',
      userProfile: '',
      type: 'image',
      content: '/api/status-image-2.jpg',
      timestamp: new Date(Date.now() - 5400000), // 1.5 hours ago
      expiresAt: new Date(Date.now() + 22.5 * 3600000)
    }
  ]);

  const handleCreateStatus = () => {
    if (statusType === 'text' && !statusText.trim()) return;
    if (statusType === 'image' && !statusImage) return;
    if (statusType === 'video' && !statusVideo) return;

    const newStatus = {
      id: Date.now(),
      type: statusType,
      content: statusType === 'text' ? statusText : (statusImage || statusVideo),
      timestamp: new Date(),
      views: 0,
      expiresAt: new Date(Date.now() + 24 * 3600000) // 24 hours from now
    };

    setMyStatuses(prev => [newStatus, ...prev]);
    setShowCreateStatus(false);
    resetStatusForm();
  };

  const resetStatusForm = () => {
    setStatusText('');
    setStatusImage(null);
    setStatusVideo(null);
    setStatusType('text');
  };

  const handleFileSelect = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      if (type === 'image') {
        setStatusImage(URL.createObjectURL(file));
        setStatusType('image');
      } else if (type === 'video') {
        setStatusVideo(URL.createObjectURL(file));
        setStatusType('video');
      }
    }
  };

  const handleDeleteStatus = (statusId) => {
    setMyStatuses(prev => prev.filter(status => status.id !== statusId));
  };

  const openStatusViewer = (status, index) => {
    setSelectedStatus(status);
    setCurrentStatusIndex(index);
  };

  const closeStatusViewer = () => {
    setSelectedStatus(null);
    setCurrentStatusIndex(0);
  };

  const nextStatus = () => {
    const allStatuses = [...myStatuses, ...recentUpdates];
    if (currentStatusIndex < allStatuses.length - 1) {
      setCurrentStatusIndex(currentStatusIndex + 1);
      setSelectedStatus(allStatuses[currentStatusIndex + 1]);
    }
  };

  const previousStatus = () => {
    if (currentStatusIndex > 0) {
      setCurrentStatusIndex(currentStatusIndex - 1);
      const allStatuses = [...myStatuses, ...recentUpdates];
      setSelectedStatus(allStatuses[currentStatusIndex - 1]);
    }
  };

  const formatTimeLeft = (expiresAt) => {
    const now = new Date();
    const timeLeft = expiresAt - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    if (minutes > 0) return `${minutes}m left`;
    return 'Expiring soon';
  };

  const renderCreateStatus = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-panel-header-background rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Create Status</h3>
          <button onClick={() => setShowCreateStatus(false)} className="text-gray-400 hover:text-white">
            <BsX />
          </button>
        </div>

        {/* Status Type Selection */}
        <div className="mb-6">
          <div className="flex gap-2 bg-gray-700 p-1 rounded">
            {[
              { id: 'text', label: 'Text', icon: <BsTextLeft /> },
              { id: 'image', label: 'Image', icon: <BsCamera /> },
              { id: 'video', label: 'Video', icon: <BsCamera /> }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setStatusType(type.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded text-sm transition-colors ${
                  statusType === type.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {type.icon}
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Content */}
        {statusType === 'text' && (
          <div className="mb-6">
            <textarea
              ref={textAreaRef}
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 bg-gray-700 rounded text-white placeholder-gray-400 resize-none"
              rows="4"
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-400 mt-2">
              {statusText.length}/500
            </div>
          </div>
        )}

        {statusType === 'image' && (
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              {statusImage ? (
                <div className="relative">
                  <img src={statusImage} alt="Status" className="w-full h-48 object-cover rounded" />
                  <button
                    onClick={() => setStatusImage(null)}
                    className="absolute top-2 right-2 p-1 bg-red-600 rounded-full text-white"
                  >
                    <BsX />
                  </button>
                </div>
              ) : (
                <div>
                  <BsCamera className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Click to add an image</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white"
                  >
                    Choose Image
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {statusType === 'video' && (
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              {statusVideo ? (
                <div className="relative">
                  <video src={statusVideo} controls className="w-full h-48 object-cover rounded" />
                  <button
                    onClick={() => setStatusVideo(null)}
                    className="absolute top-2 right-2 p-1 bg-red-600 rounded-full text-white"
                  >
                    <BsX />
                  </button>
                </div>
              ) : (
                <div>
                  <BsCamera className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Click to add a video</p>
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white"
                  >
                    Choose Video
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCreateStatus}
            className="flex-1 p-3 bg-blue-600 rounded hover:bg-blue-700 text-white"
          >
            Post Status
          </button>
          <button
            onClick={() => setShowCreateStatus(false)}
            className="flex-1 p-3 bg-gray-600 rounded hover:bg-gray-700 text-white"
          >
            Cancel
          </button>
        </div>

        {/* Hidden Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e, 'image')}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <input
          type="file"
          ref={videoInputRef}
          onChange={(e) => handleFileSelect(e, 'video')}
          accept="video/*"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );

  const renderStatusViewer = () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Status Content */}
        <div className="relative max-w-md max-h-full">
          {selectedStatus?.type === 'text' ? (
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-lg text-center">
              <p className="text-white text-xl font-medium">{selectedStatus.content}</p>
            </div>
          ) : selectedStatus?.type === 'image' ? (
            <img 
              src={selectedStatus.content} 
              alt="Status" 
              className="w-full h-auto max-h-[80vh] object-contain rounded"
            />
          ) : (
            <video 
              src={selectedStatus.content} 
              controls 
              className="w-full h-auto max-h-[80vh] object-contain rounded"
            />
          )}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={previousStatus}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
        >
          <BsChevronLeft />
        </button>
        <button
          onClick={nextStatus}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
        >
          <BsChevronRight />
        </button>

        {/* Close Button */}
        <button
          onClick={closeStatusViewer}
          className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
        >
          <BsX />
        </button>

        {/* Status Info */}
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 rounded-lg p-3">
          <div className="flex items-center justify-between text-white text-sm">
            <span>{selectedStatus?.userName || 'You'}</span>
            <span>{formatTimeLeft(selectedStatus?.expiresAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStatusItem = (status, isOwn = false) => (
    <div 
      key={status.id} 
      className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
      onClick={() => openStatusViewer(status, isOwn ? myStatuses.indexOf(status) : myStatuses.length + recentUpdates.indexOf(status))}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        {status.type === 'text' ? (
          <BsTextLeft className="text-white text-xl" />
        ) : (
          <BsCamera className="text-white text-xl" />
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="text-white font-medium">
          {isOwn ? 'You' : status.userName}
        </h3>
        <p className="text-sm text-gray-400">
          {status.type === 'text' ? status.content : `${status.type.charAt(0).toUpperCase() + status.type.slice(1)} status`}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <span>{formatTimeLeft(status.expiresAt)}</span>
          {isOwn && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FaRegEye />
                {status.views} views
              </span>
            </>
          )}
        </div>
      </div>

      {isOwn && (
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Edit functionality
            }}
            className="p-1 text-gray-400 hover:text-white"
          >
            <MdEdit />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteStatus(status.id);
            }}
            className="p-1 text-red-400 hover:text-red-300"
          >
            <MdDelete />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-panel-header-background rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Status</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateStatus(true)}
                className="p-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                <MdAdd className="text-white" />
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <BsX />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-700 p-1 rounded">
            {[
              { id: 'myStatus', label: 'My Status' },
              { id: 'recentUpdates', label: 'Recent Updates' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 rounded text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status List */}
          <div className="space-y-3">
            {activeTab === 'myStatus' ? (
              myStatuses.length === 0 ? (
                <div className="text-center py-8">
                  <BsCamera className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No status yet</p>
                  <button
                    onClick={() => setShowCreateStatus(true)}
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white"
                  >
                    Create Status
                  </button>
                </div>
              ) : (
                myStatuses.map(status => renderStatusItem(status, true))
              )
            ) : (
              recentUpdates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No recent updates</p>
                </div>
              ) : (
                recentUpdates.map(status => renderStatusItem(status, false))
              )
            )}
          </div>
        </div>
      </div>

      {showCreateStatus && renderCreateStatus()}
      {selectedStatus && renderStatusViewer()}
    </>
  );
};

export default StatusStories;
