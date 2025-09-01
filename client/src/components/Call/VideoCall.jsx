import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";

const Container = dynamic(() => import("./Container"),{ssr:false});



function VideoCall() {
  const [{videoCall,socket,userInfo},dispatch] = useStateProvider();

  useEffect(() =>{
    if(videoCall?.type==="out-going"){
      socket.current.emit("outgoing-video-call",{
        to: videoCall.id,
        from:{
          id: userInfo.id,
          profilePicture: userInfo.profileImage || userInfo.profilePicture,
          name: userInfo.name,
        },
        callType: videoCall.callType,
        roomId: videoCall.roomId,
      });
    }
  },[videoCall]);

  useEffect(() => {
    if (!socket?.current) return;

    const handleRejection = () => {
      dispatch({ type: reducerCases.END_CALL });
    };

    socket.current.on("video-call-rejected", handleRejection);

    return () => {
      socket.current.off("video-call-rejected", handleRejection);
    };
  }, [socket]);

  

  return <Container data={videoCall} />;
}

export default VideoCall;
