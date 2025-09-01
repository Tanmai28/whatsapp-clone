import React, { useState } from "react";
import Avatar from "../common/Avatar";
import {MdCall} from 'react-icons/md';
import { IoVideocam } from "react-icons/io5";
import { BiSearchAlt2 } from "react-icons/bi";
import { BsThreeDotsVertical, BsTelephone } from "react-icons/bs";
import { FaHistory, FaUser, FaRegEye, FaUsers } from "react-icons/fa";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import ContextMenu from "../common/ContextMenu";
import GroupChat from "../GroupChat/GroupChat";
import UserProfile from "../Profile/UserProfile";
import CallHistory from "../Call/CallHistory";
import StatusStories from "../Status/StatusStories";

function ChatHeader() {
  const [{currentChatUser,socket,userInfo,onlineUsers}, dispatch] = useStateProvider();

  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x:0,
    y:0,
  });

  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const showContextMenu = (e) =>{
    e.preventDefault();
    setContextMenuCordinates({x: e.pageX - 50, y: e.pageY +20});
    setIsContextMenuVisible(true);
  };

  const contextMenuOptions =[
    {
      name:"View Profile",
      icon: <FaUser />,
      callback: async() =>{
        setIsContextMenuVisible(false);
        setShowUserProfile(true);
      },
    },
    {
      name:"Call History",
      icon: <FaHistory />,
      callback: async() =>{
        setIsContextMenuVisible(false);
        setShowCallHistory(true);
      },
    },
    {
      name:"Status",
      icon: <FaRegEye />,
      callback: async() =>{
        setIsContextMenuVisible(false);
        setShowStatus(true);
      },
    },
    {
      name:"Group Chat",
      icon: <FaUsers />,
      callback: async() =>{
        setIsContextMenuVisible(false);
        setShowGroupChat(true);
      },
    },
    {
      name:"Exit Chat",
      callback: async() =>{
        setIsContextMenuVisible(false);
        dispatch({type:reducerCases.SET_EXIT_CHAT});
      },
    },
  ];

  const handleVoiceCall = () =>{
    dispatch({type:reducerCases.SET_VOICE_CALL,
      voiceCall:{
        ...currentChatUser,
        type:"out-going",
        callType:"voice",
        roomId: Date.now(),
      },
    });
  };

  const handleVideoCall = () =>{
    dispatch({type:reducerCases.SET_VIDEO_CALL,
      videoCall:{
        ...currentChatUser,
        type:"out-going",
        callType:"video",
        roomId:Date.now(),
      },
    });
  };

  const handleCallUser = (contact, type) => {
    if (type === 'voice') {
      dispatch({
        type: reducerCases.SET_VOICE_CALL,
        voiceCall: {
          ...contact,
          type: "out-going",
          callType: "voice",
          roomId: Date.now(),
        },
      });
    } else {
      dispatch({
        type: reducerCases.SET_VIDEO_CALL,
        videoCall: {
          ...contact,
          type: "out-going",
          callType: "video",
          roomId: Date.now(),
        },
      });
    }
  };

  return (
    <>
      <div className="h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background z-10">
        <div className="flex items-center justify-center gap-6">
          <Avatar type="sm" image={currentChatUser?.profilePicture}/>
          <div className="flex flex-col">
            <span className="text-primary-strong"> {currentChatUser?.name}</span>
            <span className="text-secondary text-sm">
              {
                onlineUsers.includes(currentChatUser.id) ? "online" :"offline"
              }
            </span>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <MdCall 
          className="text-panel-header-icon cursor-pointer text-xl"
            onClick={handleVoiceCall}
            title="Voice Call"
           />
           <IoVideocam className="text-panel-header-icon cursor-pointer text-xl"
           onClick={handleVideoCall}
           title="Video Call"
           />
           <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-xl" 
           onClick={() => dispatch({type:reducerCases.SET_MESSAGE_SEARCH})}
           title="Search Messages"
           />
          <BsThreeDotsVertical className="text-panel-header-icon cursor-pointer text-xl"
          onClick={(e)=>showContextMenu(e)}
          id="context-opener"
          title="More Options"
          />
          {isContextMenuVisible && (
            <ContextMenu 
            options={contextMenuOptions}
            cordinates={contextMenuCordinates}
            contextMenu={isContextMenuVisible}
            setContextMenu={setIsContextMenuVisible}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showGroupChat && (
        <GroupChat 
          group={currentChatUser} 
          onClose={() => setShowGroupChat(false)} 
        />
      )}
      
      {showUserProfile && (
        <UserProfile 
          onClose={() => setShowUserProfile(false)} 
        />
      )}
      
      {showCallHistory && (
        <CallHistory 
          onClose={() => setShowCallHistory(false)}
          onCallUser={handleCallUser}
        />
      )}
      
      {showStatus && (
        <StatusStories 
          onClose={() => setShowStatus(false)} 
        />
      )}
    </>
   );
}

export default ChatHeader;
