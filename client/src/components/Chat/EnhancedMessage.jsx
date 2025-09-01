import React, { useState } from 'react';
import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import MessageStatus from "../common/MessageStatus";
import ImageMessage from "./ImageMessage";
import VoiceMessage from "./VoiceMessage";
import { 
  BsThreeDotsVertical, 
  BsReply, 
  BsForward, 
  BsPin, 
  BsTrash,
  BsEmojiSmile,
  BsHeart,
  BsHeartFill
} from "react-icons/bs";
import { MdLocationOn, MdContactPhone } from "react-icons/md";
import { FaFileAlt } from "react-icons/fa";

const EnhancedMessage = ({ message, onReply, onForward, onDelete, onPin, onReact }) => {
  const [{ userInfo, currentChatUser }] = useStateProvider();
  const [showOptions, setShowOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const isOwnMessage = message.senderId === userInfo.id;

  const reactions = [
    { emoji: "👍", label: "thumbs up" },
    { emoji: "❤️", label: "heart" },
    { emoji: "😂", label: "joy" },
    { emoji: "😮", label: "open mouth" },
    { emoji: "😢", label: "cry" },
    { emoji: "👏", label: "clap" }
  ];

  const handleReaction = (reaction) => {
    if (onReact) {
      onReact(message.id, reaction);
    }
    setShowReactions(false);
  };

  const renderMessageContent = () => {
    // Handle deleted messages
    if (message.isDeleted) {
      return (
        <div className="text-gray-500 italic px-2 py-[5px] text-sm rounded-md flex gap-2 items-end max-w-[45%]">
          <span>This message was deleted</span>
          <div className="flex gap-1 items-end">
            <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
              {calculateTime(message.createdAt)}
            </span>
          </div>
        </div>
      );
    }

    switch (message.type) {
      case "text":
        return (
          <div className={`text-white px-2 py-[5px] text-sm rounded-md flex gap-2 items-end max-w-[45%] ${
            isOwnMessage ? "bg-outgoing-background" : "bg-incoming-background"
          }`}>
            {/* Reply preview */}
            {message.isReply && message.replyToMessage && (
              <div className="w-full mb-2 p-2 bg-black bg-opacity-20 rounded border-l-4 border-blue-400">
                <div className="text-xs text-gray-300 mb-1">
                  {message.replyToMessage.senderId === userInfo.id ? "You" : message.replyToMessage.sender?.name}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {message.replyToMessage.messages}
                </div>
              </div>
            )}
            
            <span className="break-all">{message.messages}</span>
            
            <div className="flex gap-1 items-end">
              <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
                {calculateTime(message.createdAt)}
              </span>
              {isOwnMessage && (
                <MessageStatus messageStatus={message.messageStatus} />
              )}
            </div>
          </div>
        );
      
      case "image":
        return <ImageMessage message={message} />;
      
      case "audio":
        return <VoiceMessage message={message} />;
      
      case "video":
        return (
          <div className={`rounded-lg p-2 max-w-[45%] ${
            isOwnMessage ? "bg-outgoing-background" : "bg-incoming-background"
          }`}>
            <video 
              controls 
              className="w-full rounded"
              src={message.messages}
            />
            <div className="text-xs text-gray-400 mt-1">
              {calculateTime(message.createdAt)}
            </div>
          </div>
        );
      
      case "document":
        return (
          <div className={`rounded-lg p-3 max-w-[45%] ${
            isOwnMessage ? "bg-outgoing-background" : "bg-incoming-background"
          }`}>
            <div className="flex items-center gap-3">
              <FaFileAlt className="text-2xl text-blue-400" />
              <div>
                <div className="text-sm font-medium">{message.metadata?.fileName || "Document"}</div>
                <div className="text-xs text-gray-400">{message.metadata?.fileSize || ""}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {calculateTime(message.createdAt)}
            </div>
          </div>
        );
      
      case "location":
        return (
          <div className={`rounded-lg p-3 max-w-[45%] ${
            isOwnMessage ? "bg-outgoing-background" : "bg-incoming-background"
          }`}>
            <div className="flex items-center gap-3">
              <MdLocationOn className="text-2xl text-red-400" />
              <div>
                <div className="text-sm font-medium">Location</div>
                <div className="text-xs text-gray-400">{message.messages}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {calculateTime(message.createdAt)}
            </div>
          </div>
        );
      
      case "contact":
        return (
          <div className={`rounded-lg p-3 max-w-[45%] ${
            isOwnMessage ? "bg-outgoing-background" : "bg-incoming-background"
          }`}>
            <div className="flex items-center gap-3">
              <MdContactPhone className="text-2xl text-green-400" />
              <div>
                <div className="text-sm font-medium">Contact</div>
                <div className="text-xs text-gray-400">{message.messages}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {calculateTime(message.createdAt)}
            </div>
          </div>
        );
      
      case "sticker":
        return (
          <div className={`rounded-lg p-2 max-w-[45%] ${
            isOwnMessage ? "bg-outgoing-background" : "bg-incoming-background"
          }`}>
            <img 
              src={message.messages} 
              alt="Sticker" 
              className="w-32 h-32 object-contain"
            />
            <div className="text-xs text-gray-400 mt-1">
              {calculateTime(message.createdAt)}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;
    
    // Group reactions by emoji and count them
    const reactionCounts = message.reactions.reduce((acc, reaction) => {
      acc[reaction.reaction] = (acc[reaction.reaction] || 0) + 1;
      return acc;
    }, {});
    
    return (
      <div className="flex gap-1 mt-1">
        {Object.entries(reactionCounts).map(([emoji, count], index) => (
          <span key={index} className="text-xs bg-gray-700 px-2 py-1 rounded-full">
            {emoji} {count > 1 && count}
          </span>
        ))}
      </div>
    );
  };

  const renderForwardedIndicator = () => {
    if (message.isForwarded) {
      return (
        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
          <BsForward className="text-xs" />
          Forwarded
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-2 group relative`}>
      <div className="relative">
        {/* Forwarded indicator */}
        {renderForwardedIndicator()}
        
        {/* Message content */}
        <div>
          {renderMessageContent()}
          {renderReactions()}
        </div>
        
        {/* Message options */}
        <div className={`absolute top-0 ${isOwnMessage ? "-left-12" : "-right-12"} opacity-0 group-hover:opacity-100 transition-opacity`}>
          <div className="flex gap-1">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="p-1 bg-gray-700 rounded hover:bg-gray-600"
              title="React"
            >
              <BsEmojiSmile className="text-sm text-white" />
            </button>
            
            {onReply && (
              <button
                onClick={() => onReply(message)}
                className="p-1 bg-gray-700 rounded hover:bg-gray-600"
                title="Reply"
              >
                <BsReply className="text-sm text-white" />
              </button>
            )}
            
            {onForward && (
              <button
                onClick={() => onForward(message)}
                className="p-1 bg-gray-700 rounded hover:bg-gray-600"
                title="Forward"
              >
                <BsForward className="text-sm text-white" />
              </button>
            )}
            
            {isOwnMessage && onPin && (
              <button
                onClick={() => onPin(message)}
                className="p-1 bg-gray-700 rounded hover:bg-gray-600"
                title="Pin"
              >
                <BsPin className="text-sm text-white" />
              </button>
            )}
            
            {isOwnMessage && onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                className="p-1 bg-gray-700 rounded hover:bg-gray-600"
                title="Delete"
              >
                <BsTrash className="text-sm text-white" />
              </button>
            )}
          </div>
        </div>
        
        {/* Reactions picker */}
        {showReactions && (
          <div className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg p-2 shadow-lg z-50">
            <div className="flex gap-2">
              {reactions.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => handleReaction(reaction.emoji)}
                  className="text-2xl hover:scale-110 transition-transform"
                  title={reaction.label}
                >
                  {reaction.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedMessage;
