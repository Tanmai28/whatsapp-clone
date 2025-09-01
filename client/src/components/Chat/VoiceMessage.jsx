import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Avatar from "../common/Avatar";
import { FaPlay, FaStop } from "react-icons/fa";
import { calculateTime } from "@/utils/CalculateTime";
import MessageStatus from "../common/MessageStatus";
import { HOST } from "@/utils/ApiRoutes";

// Dynamically import WaveSurfer to avoid SSR issues
const WaveSurfer = dynamic(() => import("wavesurfer.js"), {
  ssr: false,
  loading: () => <div className="w-60 h-8 bg-gray-600 rounded animate-pulse" />
});

function VoiceMessage({message}) {
  const [{currentChatUser, userInfo}] = useStateProvider();
  const [audioMessage, setAudioMessage] = useState(null);
  const [isPlaying,setIsPlaying] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const waveFormRef = useRef(null);
  const waveform = useRef(null);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !WaveSurfer) return;

    if(waveform.current === null){
      try {
        waveform.current = WaveSurfer.create({
          container: waveFormRef.current,
          waveColor: "#ccc",
          progressColor: "#4a9eff",
          cursorColor: "#7ae3c3",
          barWidth: 2,
          height:30,
          responsive: true,
        });
        
        waveform.current.on("finish", () => {
          setIsPlaying(false);
        });
      } catch (error) {
        console.error("Error creating waveform:", error);
      }
    }
    
    return () => {
      if (waveform.current) {
        try {
          waveform.current.destroy();
        } catch (error) {
          console.error("Error destroying waveform:", error);
        }
      }
    };
  }, [isClient]);

  useEffect(() =>{
    if (!isClient || !waveform.current) return;
    
    const audioURL = `${HOST}/${message.messages}`
    const audio = new Audio(audioURL)
    setAudioMessage(audio)
    
    try {
      waveform.current.load(audioURL)
      waveform.current.on("ready", ()=>{
        setTotalDuration(waveform.current.getDuration());
      });
    } catch (error) {
      console.error("Error loading audio:", error);
    }
  },[message.messages, isClient])

  useEffect(() =>{
    if (audioMessage) {
      const updatePlaybackTime =() =>{
        setCurrentPlaybackTime(audioMessage.currentTime);
      };
      audioMessage.addEventListener("timeupdate",updatePlaybackTime);
      return () =>{
        audioMessage.removeEventListener("timeupdate",updatePlaybackTime);
      };
    }
  },[audioMessage]);

  const formatTime =(time) =>{
    if(isNaN(time)) return "00:00";
    const minutes = Math.floor(time/60);
    const seconds = Math.floor(time%60);
    return `${minutes.toString().padStart(2,'0')}:${seconds
      .toString()
      .padStart(2,"0")}`;
  };

  const handlePlayAudio = () =>{
    if(audioMessage && waveform.current){
      try {
        waveform.current.stop();
        waveform.current.play();
        audioMessage.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    }
  };
  
  const handlePauseAudio = ()=>{
    if (waveform.current && audioMessage) {
      try {
        waveform.current.stop();
        audioMessage.pause();
        setIsPlaying(false);
      } catch (error) {
        console.error("Error pausing audio:", error);
      }
    }
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className={`flex items-center gap-5 text-white px-2 pr-2 py-4 text-sm rounded-md ${
        message.senderId === currentChatUser.id 
        ? "bg-incoming-background" 
        : "bg-outgoing-background"
        }`}
      >
        <div>
          <Avatar type="lg" image={currentChatUser?.profilePicture} />
        </div>
        <div className="w-60 h-8 bg-gray-600 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-5 text-white px-2 pr-2 py-4 text-sm rounded-md ${
      message.senderId === currentChatUser.id 
      ? "bg-incoming-background" 
      : "bg-outgoing-background"
      }`}
    >
      <div>
        <Avatar type="lg" image={currentChatUser?.profilePicture} />
      </div>
      <div className="cursor-pointer text-xl">
        {
          !isPlaying ? (
          <FaPlay onClick={handlePlayAudio} /> 
          ):(
             <FaStop onClick={handlePauseAudio} />
        )}
      </div>
      <div className="relative">
        <div className="w-60" ref={waveFormRef} />
        <div className="text-bubble-meta text-[11px] pt-1 flex justify-between absolute bottom-[-22px] w-full">
          <span>
            {formatTime(isPlaying ? currentPlaybackTime : totalDuration)}
          </span>
          <div className="flex gap-1">
            <span>{calculateTime(message.createdAt)}</span>
            {
              message.senderId === userInfo.id && <MessageStatus messageStatus={message.messageStatus} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceMessage;
