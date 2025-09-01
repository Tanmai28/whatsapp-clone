import React, { useState, useRef, useEffect } from 'react';
import { useStateProvider } from "@/context/StateContext";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  BsEmojiSmile, 
  BsPaperclip, 
  BsMic, 
  BsSend, 
  BsImage, 
  BsFileEarmark,
  BsLocation,
  BsPerson,
  BsSticky,
  BsCamera
} from "react-icons/bs";
import { MdLocationOn, MdContactPhone, MdCameraAlt } from "react-icons/md";
import EmojiPicker from 'emoji-picker-react';
import { useDropzone } from 'react-dropzone';
import { useReactToPrint } from 'react-to-print';
import StickerPicker from '../common/StickerPicker';

const EnhancedMessageBar = ({ replyMessage, forwardMessage, onClearReply, onClearForward }) => {
  const [{ userInfo, currentChatUser, socket }] = useStateProvider();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="bg-gray-800 p-3 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-700 rounded animate-pulse" />
          <div className="flex-1 h-10 bg-gray-700 rounded animate-pulse" />
          <div className="w-8 h-8 bg-gray-700 rounded animate-pulse" />
          <div className="w-8 h-8 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.webm'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach(file => handleFileUpload(file));
    }
  });

  const handleSendMessage = async () => {
    if (!message.trim() && !replyMessage && !forwardMessage) return;

    if (forwardMessage) {
      // Handle forwarding
      handleForwardMessage(forwardMessage);
    } else {
      // Send new message
      try {
        const messageData = {
          to: currentChatUser.id,
          from: userInfo.id,
          message: message.trim(),
          type: 'text',
          replyToMessageId: replyMessage?.id || null
        };

        // Send via socket for real-time
        if (socket?.current) {
          socket.current.emit("send-msg", messageData);
        }

        // Also save to database
        const response = await axios.post('/api/enhanced/messages/reply', messageData);
        
        if (response.data.success) {
          setMessage('');
          onClearReply();
          toast.success('Message sent');
        }
      } catch (error) {
        toast.error('Failed to send message');
      }
    }
  };

  const handleForwardMessage = async (originalMessage) => {
    try {
      const response = await axios.post('/api/enhanced/messages/forward', {
        to: currentChatUser.id,
        from: userInfo.id,
        originalMessageId: originalMessage.id
      });
      
      if (response.data.success) {
        // Send via socket for real-time
        if (socket?.current) {
          socket.current.emit("send-msg", {
            to: currentChatUser.id,
            from: userInfo.id,
            message: response.data.message,
            type: 'forwarded'
          });
        }
        
        toast.success('Message forwarded');
        onClearForward();
      }
    } catch (error) {
      toast.error('Failed to forward message');
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userInfo.id);
    formData.append('receiverId', currentChatUser.id);
    formData.append('type', getFileType(file.type));
    formData.append('replyToMessageId', replyMessage?.id || null);

    try {
      const response = await axios.post('/api/enhanced/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        // Send via socket for real-time
        if (socket?.current) {
          socket.current.emit("send-msg", {
            to: currentChatUser.id,
            from: userInfo.id,
            message: response.data.message,
            type: 'file'
          });
        }
        
        toast.success('File sent successfully');
        onClearReply();
      }
    } catch (error) {
      toast.error('Failed to send file');
    }
  };

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
    return 'document';
  };

  const handleImageCapture = () => {
    imageInputRef.current?.click();
  };

  const handleVideoCapture = () => {
    videoInputRef.current?.click();
  };

  const handleDocumentSelect = () => {
    documentInputRef.current?.click();
  };

  const handleLocationShare = async () => {
    if (!isClient) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = {
            to: currentChatUser.id,
            from: userInfo.id,
            message: `${latitude},${longitude}`,
            type: 'location',
            metadata: {
              latitude,
              longitude,
              address: await reverseGeocode(latitude, longitude)
            },
            replyToMessageId: replyMessage?.id || null
          };

          try {
            const response = await axios.post('/api/enhanced/messages/location', locationData);
            
            if (response.data.success) {
              // Send via socket for real-time
              if (socket?.current) {
                socket.current.emit("send-msg", {
                  to: currentChatUser.id,
                  from: userInfo.id,
                  message: response.data.message,
                  type: 'location'
                });
              }
              
              toast.success('Location shared');
              onClearReply();
            }
          } catch (error) {
            toast.error('Failed to share location');
          }
        },
        (error) => {
          toast.error('Unable to get location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      // For demo purposes, return coordinates
      // In production, you would use a geocoding service like Google Maps API
      return `${lat}, ${lng}`;
    } catch (error) {
      return 'Unknown location';
    }
  };

  const handleContactShare = async () => {
    // For demo purposes, sharing current user's contact
    const contactData = {
      to: currentChatUser.id,
      from: userInfo.id,
      message: JSON.stringify({
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone || 'N/A'
      }),
      type: 'contact',
      replyToMessageId: replyMessage?.id || null
    };

    try {
      const response = await axios.post('/api/enhanced/messages/contact', contactData);
      
      if (response.data.success) {
        // Send via socket for real-time
        if (socket?.current) {
          socket.current.emit("send-msg", {
            to: currentChatUser.id,
            from: userInfo.id,
            message: response.data.message,
            type: 'contact'
          });
        }
        
        toast.success('Contact shared');
        onClearReply();
      }
    } catch (error) {
      toast.error('Failed to share contact');
    }
  };

  const handleStickerSelect = (stickerUrl) => {
    const stickerData = {
      to: currentChatUser.id,
      from: userInfo.id,
      message: stickerUrl,
      type: 'sticker',
      replyToMessageId: replyMessage?.id || null
    };

    try {
      if (socket?.current) {
        socket.current.emit("send-msg", stickerData);
        toast.success('Sticker sent');
        onClearReply();
      }
    } catch (error) {
      toast.error('Failed to send sticker');
    }
  };

  const startRecording = async () => {
    if (!isClient) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('userId', userInfo.id);
        formData.append('receiverId', currentChatUser.id);
        formData.append('replyToMessageId', replyMessage?.id || null);

        try {
          const response = await axios.post('/api/enhanced/messages/audio', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          if (response.data.success) {
            // Send via socket for real-time
            if (socket?.current) {
              socket.current.emit("send-msg", {
                to: currentChatUser.id,
                from: userInfo.id,
                message: response.data.message,
                type: 'audio'
              });
            }
            
            toast.success('Voice message sent');
            onClearReply();
          }
        } catch (error) {
          toast.error('Failed to send voice message');
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-gray-800 p-3 border-t border-gray-700">
      {/* Reply/Forward Preview */}
      {(replyMessage || forwardMessage) && (
        <div className="bg-gray-700 p-2 mb-3 rounded">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">
                {replyMessage ? 'Replying to' : 'Forwarding'} {replyMessage?.senderId === userInfo.id ? 'yourself' : currentChatUser.name}
              </div>
              <div className="text-sm text-gray-300 truncate">
                {replyMessage?.messages || forwardMessage?.messages}
              </div>
            </div>
            <button
              onClick={replyMessage ? onClearReply : onClearForward}
              className="text-gray-400 hover:text-white ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Message Input */}
      <div className="flex items-center gap-2">
        {/* Emoji Picker */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-400 hover:text-white rounded"
          >
            <BsEmojiSmile />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>

        {/* Attachment Menu */}
        <div className="relative">
          <button
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className="p-2 text-gray-400 hover:text-white rounded"
          >
            <BsPaperclip />
          </button>
          {showAttachmentMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-gray-700 rounded-lg p-2 shadow-lg z-50 min-w-[200px]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleImageCapture}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-600 text-sm"
                >
                  <BsImage />
                  Photo
                </button>
                <button
                  onClick={handleVideoCapture}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-600 text-sm"
                >
                  <BsCamera />
                  Video
                </button>
                <button
                  onClick={handleDocumentSelect}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-600 text-sm"
                >
                  <BsFileEarmark />
                  Document
                </button>
                <button
                  onClick={handleLocationShare}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-600 text-sm"
                >
                  <MdLocationOn />
                  Location
                </button>
                <button
                  onClick={handleContactShare}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-600 text-sm"
                >
                  <MdContactPhone />
                  Contact
                </button>
                <button
                  onClick={() => {
                    setShowStickerPicker(true);
                    setShowAttachmentMenu(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-600 text-sm"
                >
                  <BsSticky />
                  Stickers
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dropzone for drag & drop */}
        <div {...getRootProps()} className="flex-1">
          <input {...getInputProps()} />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full bg-gray-700 text-white px-3 py-2 rounded"
          />
        </div>

        {/* Voice Recording */}
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          className={`p-2 rounded ${
            isRecording ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
          title={isRecording ? 'Recording... Release to stop' : 'Hold to record voice message'}
        >
          <BsMic />
        </button>

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() && !replyMessage && !forwardMessage}
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <BsSend />
        </button>
      </div>

      {/* Recording Timer */}
      {isRecording && (
        <div className="mt-2 text-center">
          <div className="text-red-400 text-sm">
            Recording... {formatTime(recordingTime)}
          </div>
        </div>
      )}

      {/* Sticker Picker */}
      {showStickerPicker && (
        <StickerPicker
          onStickerSelect={handleStickerSelect}
          onClose={() => setShowStickerPicker(false)}
        />
      )}

      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
};

export default EnhancedMessageBar;
