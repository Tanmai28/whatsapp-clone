import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";

const Container = dynamic(() => import("./Container"),{ssr:false});



function VoiceCall() {
  const [{voiceCall,socket,userInfo},dispatch] = useStateProvider();

  useEffect(() =>{
    if(voiceCall.type==="out-going"){
      socket.current.emit("outgoing-voice-call",{
        to: voiceCall.id,
        from:{
          id: userInfo.id,
          profilePicture: userInfo.profileImage || userInfo.profilePicture,
          name: userInfo.name,
        },
        callType: voiceCall.callType,
        roomId: voiceCall.roomId,
      });
    }
  },[voiceCall]);

  useEffect(() => {
    if (!socket?.current) return;

    const handleRejection = () => {
      dispatch({ type: reducerCases.END_CALL });
    };

    socket.current.on("voice-call-rejected", handleRejection);

    return () => {
      socket.current.off("voice-call-rejected", handleRejection);
    };
  }, [socket]);

  

  return <Container data={voiceCall} />;
}

export default VoiceCall;
