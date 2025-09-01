// import { reducerCases } from "@/context/constants";
// import { useStateProvider } from "@/context/StateContext";
// import { GET_CALL_TOKEN } from "@/utils/ApiRoutes";
// import Image from "next/image";
// import React, { useEffect, useState } from "react";
// import { MdOutlineCallEnd } from "react-icons/md";
// import { ZegoExpressEngine } from "zego-express-engine-webrtc";
// import axios from "axios";


// // // Patch getStats to prevent Zego crashing on invalid track
// if (typeof window !== "undefined" && window.RTCPeerConnection) {
//   const originalGetStats = RTCPeerConnection.prototype.getStats;
//   RTCPeerConnection.prototype.getStats = function(track) {
//     if (track && typeof track.kind === "string") {
//       return originalGetStats.call(this, track);
//     } else {
//       console.warn("Blocked invalid getStats call by Zego:", track);
//       return originalGetStats.call(this); // fallback to global stats
//     }
//   };
// }


// function Container({data}) {
//   const [{socket,userInfo},dispatch] = useStateProvider();
//   const [callAccepted, setCallAccepted] = useState(false);
//   const [token, setToken] = useState(undefined);
//   const [zgVar,setZgVar] = useState(undefined);
//   const [localStream,setLocalStream] = useState(undefined);
//   const [publishStream, setPublishStream] = useState(undefined);

//   useEffect(()=>{
//     if(data.type === "out-going") 
//       socket.current.on("accept-call",() => setCallAccepted(true));
//     else{
//       setTimeout(() =>{
//         setCallAccepted(true);
//       },1000);
//     }
//   },[data]);


//   useEffect(() =>{
//     const getToken = async() =>{
//       try {
//         const {
//           data:{token: returnedToken},
//         } = await axios.get(`${GET_CALL_TOKEN}/${userInfo.id}`);
//         setToken(returnedToken);
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     getToken();
//   },[callAccepted]);


//   useEffect(()=>{
//     const startCall = async() =>{
//       import("zego-express-engine-webrtc").then(async({ZegoExpressEngine})=>{
//         const zg = new ZegoExpressEngine(process.env.NEXT_PUBLIC_ZEGO_APP_ID,process.env.NEXT_PUBLIC_ZEGO_SERVER_ID);
//         setZgVar(zg);
//         zg.on("roomStreamUpdate",async(roomId, updateType, streamList,extendedData) =>{
//           if(updateType === "ADD"){
//             const rmVideo = document.getElementById("remote-video");
//             const vd = document.createElement(data.callType === "video" ? "video" : "audio");
//             vd.id = streamList[0].streamID;
//             vd.autoplay = true;
//             vd.playsInline=true;
//             vd.muted = false;
//             if(rmVideo){
//               rmVideo.appendChild(vd);
//             }
//             zg.startPlayingStream(streamList[0].streamID,{
//               audio:true,
//               video:true,
//             }).then((stream) => (vd.srcObject = stream));

//           }else if(updateType === "DELETE" && zg && localStream && streamList[0].streamID)
//             {
//             zg.destroyStream(localStream);
//             zg.stopPublishingStream(streamList[0].streamID);
//             zg.logoutRoom(data.roomId.toString());
//             dispatch({ type: reducerCases.END_CALL});
//             }
//         }
//        );
//         await zg.loginRoom(
//           data.roomId.toString(),token,{userID:userInfo.id.toString(),userName:userInfo.name},{userUpdate:true}
//         );
      
//         //For Remote Video
//       const localStream = await zg.createStream({
//         camera:{
//           audio:true,
//           video:data.callType === "video" ? true : false,
//         },
//       });
    
//       const localVideo = document.getElementById("local-audio");
//       const videoElement = document.createElement(data.callType === "video" ? "video" : "audio");
//       videoElement.id = "video-local-zego";
//       videoElement.className = "h-28 w-32";
//       videoElement.autoplay=true;
//       videoElement.muted = false;
//       videoElement.playsInline = true;

//       localVideo.appendChild(videoElement);

//       const td = document.getElementById("video-local-zego");
//       td.srcObject = localStream;
//       const streamID = '123' + Date.now();
//       setPublishStream(streamID);
//       setLocalStream(localStream);
//       zg.startPublishingStream(streamID, localStream);
//       }
//     );
//     };
//     if(token){
//       startCall();
//     }

//   },[token]);

//   const endCall = () =>{
//     const id = data.id;
//     if(zgVar && localStream && publishStream){
//       zgVar.destroyStream(localStream);
//       zgVar.stopPublishingStream(publishStream);
//       zgVar.logoutRoom(data.roomId.toString());
//     }
//     if(data.callType === "voice"){
//       socket.current.emit("reject-voice-call",{
//       from: id,
//     });
//     }else{
//       socket.current.emit("reject-video-call",{
//         from: id,
//     });
//   }
//     dispatch({type: reducerCases.END_CALL});
//   };

//   return( 
//   <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white">
//     <div className="flex flex-col gap-3 items-center">
//       <span className="text-5xl">{data.name}</span>
//       <span className="text-lg">
//         {
//           callAccepted && data.callType !== "video" 
//           ? "On going call" 
//           : "Calling"
//         }
//       </span>
//     </div>
//     {(!callAccepted || data.callType=="audio") && (
//       <div className="my-24">
//     <Image
//     src={data.profileImage || data.profilePicture } 
//     alt= "avatar" 
//     height={300} 
//     width={300} 
//     className="rounded-full" 
//     />
//     </div>
//     )}
//     <div className="my-5 relative" id="remote-video">
//     <div className="absolute bottom-5 right-5" id="local-audio">
//     </div>      
//     </div>
//     <div className="h-16 w-16 bg-red-600 flex items-center justify-center rounded-full">
//       <MdOutlineCallEnd className="text-3xl cursor-pointer" onClick={endCall}/>
//     </div>
//   </div>
// );
// }

// export default Container;


"use client";

import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { GET_CALL_TOKEN } from "@/utils/ApiRoutes";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { MdOutlineCallEnd } from "react-icons/md";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import axios from "axios";

// ✅ Patch getStats to prevent Zego crash on invalid track
if (typeof window !== "undefined" && window.RTCPeerConnection) {
  const originalGetStats = RTCPeerConnection.prototype.getStats;
  RTCPeerConnection.prototype.getStats = function (track) {
    if (track instanceof MediaStreamTrack) {
      return originalGetStats.call(this, track);
    } else {
      console.warn("🚫 Zego blocked getStats with invalid track:", track);
      return originalGetStats.call(this); // fallback global stats
    }
  };
}

function Container({ data }) {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAccepted, setCallAccepted] = useState(false);
  const [token, setToken] = useState(undefined);
  const [zgVar, setZgVar] = useState(undefined);
  const [localStream, setLocalStream] = useState(undefined);
  const [publishStream, setPublishStream] = useState(undefined);

  useEffect(() => {
    if (data.type === "out-going") {
      socket.current.on("accept-call", () => setCallAccepted(true));
    } else {
      setTimeout(() => {
        setCallAccepted(true);
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const {
          data: { token: returnedToken },
        } = await axios.get(`${GET_CALL_TOKEN}/${userInfo.id}`);
        setToken(returnedToken);
      } catch (error) {
        console.log(error);
      }
    };
    if (callAccepted) getToken();
  }, [callAccepted]);

  useEffect(() => {
    const createSafeStream = async (zg, config) => {
      try {
        const stream = await zg.createStream(config);
        if (!stream?.getTracks?.().length) throw new Error("No tracks found");
        return stream;
      } catch (err) {
        console.error("🔥 Stream creation failed:", err);
        return null;
      }
    };

    const startCall = async () => {
      const { ZegoExpressEngine } = await import("zego-express-engine-webrtc");
      const zg = new ZegoExpressEngine(
        process.env.NEXT_PUBLIC_ZEGO_APP_ID,
        process.env.NEXT_PUBLIC_ZEGO_SERVER_ID
      );
      setZgVar(zg);

      zg.on("roomStreamUpdate", async (roomId, updateType, streamList) => {
        if (updateType === "ADD") {
          const rmVideo = document.getElementById("remote-video");
          const vd = document.createElement(
            data.callType === "video" ? "video" : "audio"
          );
          vd.id = streamList[0].streamID;
          vd.autoplay = true;
          vd.playsInline = true;
          vd.muted = false;

          if (rmVideo) rmVideo.appendChild(vd);

          zg.startPlayingStream(streamList[0].streamID, {
            audio: true,
            video: true,
          }).then((stream) => (vd.srcObject = stream));
        } else if (
          updateType === "DELETE" &&
          zg &&
          localStream &&
          streamList[0].streamID
        ) {
          zg.destroyStream(localStream);
          zg.stopPublishingStream(streamList[0].streamID);
          zg.logoutRoom(data.roomId.toString());
          dispatch({ type: reducerCases.END_CALL });
        }
      });

      await zg.loginRoom(
        data.roomId.toString(),
        token,
        {
          userID: userInfo.id.toString(),
          userName: userInfo.name,
        },
        { userUpdate: true }
      );

      const stream = await createSafeStream(zg, {
        camera: {
          audio: true,
          video: data.callType === "video",
        },
      });

      if (!stream) return;

      const localVideo = document.getElementById("local-audio");
      const videoElement = document.createElement(
        data.callType === "video" ? "video" : "audio"
      );
      videoElement.id = "video-local-zego";
      videoElement.className = "h-28 w-32";
      videoElement.autoplay = true;
      videoElement.muted = false;
      videoElement.playsInline = true;

      localVideo.appendChild(videoElement);
      videoElement.srcObject = stream;

      const streamID = "123" + Date.now();
      setPublishStream(streamID);
      setLocalStream(stream);
      zg.startPublishingStream(streamID, stream);
    };

    if (token) startCall();
  }, [token]);

  const endCall = () => {
    const id = data.id;
    if (zgVar && localStream && publishStream) {
      zgVar.destroyStream(localStream);
      zgVar.stopPublishingStream(publishStream);
      zgVar.logoutRoom(data.roomId.toString());
    }

    if (data.callType === "voice") {
      socket.current.emit("reject-voice-call", { from: id });
    } else {
      socket.current.emit("reject-video-call", { from: id });
    }

    dispatch({ type: reducerCases.END_CALL });
  };

  return (
    <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white">
      <div className="flex flex-col gap-3 items-center">
        <span className="text-5xl">{data.name}</span>
        <span className="text-lg">
          {callAccepted && data.callType !== "video" ? "On going call" : "Calling"}
        </span>
      </div>

      {(!callAccepted || data.callType === "audio") && (
        <div className="my-24">
          <Image
            src={data.profileImage || data.profilePicture}
            alt="avatar"
            height={300}
            width={300}
            className="rounded-full"
          />
        </div>
      )}

      <div className="my-5 relative" id="remote-video">
        <div className="absolute bottom-5 right-5" id="local-audio"></div>
      </div>

      <div className="h-16 w-16 bg-red-600 flex items-center justify-center rounded-full">
        <MdOutlineCallEnd className="text-3xl cursor-pointer" onClick={endCall} />
      </div>
    </div>
  );
}

export default Container;
