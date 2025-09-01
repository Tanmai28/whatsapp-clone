import React from "react";
import ChatHeader from "./ChatHeader";
import EnhancedChatContainer from "./EnhancedChatContainer";

function Chat() {
  return (
     <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col h-[100vh] z-10">
      <EnhancedChatContainer />
      </div>
      );
}

export default Chat;
