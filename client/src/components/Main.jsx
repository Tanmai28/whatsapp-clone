import React, { useEffect, useRef, useState } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { CHECK_USER_ROUTE, GET_MESSAGES_ROUTE } from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import axios from "axios";
import { reducerCases } from "@/context/constants";
import Chat from "./Chat/Chat";
import dynamic from "next/dynamic";
import { HOST } from "@/utils/ApiRoutes";
import SearchMessages from "./Chat/SearchMessages";
import VideoCall from "./Call/VideoCall";
import VoiceCall from "./Call/VoiceCall";
import IncomingVideoCall from "./common/IncomingVideoCall";
import IncomingCall from "./common/IncomingCall";

// Dynamically import socket.io-client to avoid SSR issues
const io = dynamic(() => import("socket.io-client"), { ssr: false });

function Main() {
  const router = useRouter();
  const [{ userInfo,currentChatUser, messagesSearch,videoCall,voiceCall,incomingVoiceCall,incomingVideoCall}, dispatch] = useStateProvider();
  const [redirectLogin, setRedirectLogin] = useState(false);
  const socket = useRef();
  const [socketEvent, setSocketEvent] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (redirectLogin) router.push("/login");
  }, [redirectLogin]);

  onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (!currentUser)  setRedirectLogin(true);
      if (!userInfo && currentUser?.email) {
          const { data } = await axios.post(CHECK_USER_ROUTE, {
            email: currentUser.email});

          if (!data.status) {
              router.push("/login");
          }
          console.log({data});
          if(data?.data){
          const { id, name, email, profilePicture: profileImage, status } = data.data;
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: { id, name, email, profileImage, status },
          });
        }
        }
      });

   useEffect(()=>{
    if(userInfo && isClient && io){
      try {
        socket.current = io(HOST);
        socket.current.emit("add-user",userInfo.id);
        dispatch({type:reducerCases.SET_SOCKET,socket });
      } catch (error) {
        console.error("Error connecting to socket:", error);
      }
    }
   },[userInfo, isClient]); 

   useEffect(()=>{
    if(socket.current && !socketEvent && isClient){
      socket.current.on("msg-recieve",(data)=>{
        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage:{
            ...data.message,
          },
        });
      });

      socket.current.on("incoming-voice-call",({from,roomId,callType}) =>{
        dispatch({
          type: reducerCases.SET_INCOMING_VOICE_CALL,
          incomingVoiceCall: { ...from, roomId, callType},
        });
      });

      socket.current.on("incoming-video-call",({from,roomId,callType}) =>{
        dispatch({
          type: reducerCases.SET_INCOMING_VIDEO_CALL,
          incomingVideoCall: { ...from, roomId, callType},
        });
      });

      socket.current.on("voice-call-rejected",() =>{
        dispatch({
          type: reducerCases.END_CALL,
        });
      });
      socket.current.on("video-call-rejected",() =>{
        dispatch({
          type: reducerCases.END_CALL,
        });
      });
    
      socket.current.on("online-users",({onlineUsers})=>{
        dispatch({
          type: reducerCases.SET_ONLINE_USERS,
          onlineUsers,
        });
      });

      setSocketEvent(true);
    }
   },[socket.current, isClient]);

  useEffect(()=>{
    const getMessages = async () => {
      const {
        data:{messages},
      } = await axios.get( `${GET_MESSAGES_ROUTE}/${userInfo.id}/${currentChatUser.id}` );
      dispatch({ type: reducerCases.SET_MESSAGES ,messages });
    };
    if(currentChatUser?.id){
      getMessages();
    }
  },[currentChatUser,userInfo]);

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="grid grid-cols-main h-screen w-screen max-h-screen max-w-full">
        <div className="bg-panel-header-background flex flex-col">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-700"></div>
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-conversation-panel-background flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
    {incomingVideoCall && <IncomingVideoCall />}
    {incomingVoiceCall && <IncomingCall />}

    {
      videoCall && <div className="h-screen w-screen max-h-full overflow-hidden">
        <VideoCall />
      </div>
    }

    {
      voiceCall && <div className="h-screen w-screen max-h-full overflow-hidden">
        <VoiceCall />
      </div>
    }

    {!videoCall && !voiceCall && 
    <div className="grid grid-cols-main h-screen w-screen max-h-screen max-w-full">
  <ChatList />
  {currentChatUser ? (
    <div className={`grid ${messagesSearch ? "grid-cols-2" : "grid-cols-1"} w-full`}>
      <Chat />
      {messagesSearch && <SearchMessages />}
    </div>
  ) : (
    <Empty />
  )}
</div>
}
    </>
  );
}

export default Main;
