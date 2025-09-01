import React, { useState, useEffect, useRef } from 'react';
import { useStateProvider } from "@/context/StateContext";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  BsThreeDotsVertical, 
  BsSearch, 
  BsPlus, 
  BsTrash, 
  BsCrown,
  BsShield,
  BsPerson,
  BsPersonPlus,
  BsPersonX,
  BsGear,
  BsLink,
  BsQrCode,
  BsCamera,
  BsPencil,
  BsVolumeMute,
  BsVolumeUp,
  BsArchive,
  BsExit
} from "react-icons/bs";
import { MdGroup, MdAdminPanelSettings, MdBlock } from "react-icons/md";
import Avatar from "../common/Avatar";
import EnhancedMessage from "../Chat/EnhancedMessage";
import EnhancedMessageBar from "../Chat/EnhancedMessageBar";

const EnhancedGroupChat = ({ groupId, onBack }) => {
  const [{ userInfo }] = useStateProvider();
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (groupId) {
      loadGroupData();
      loadGroupMessages();
    }
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadGroupData = async () => {
    try {
      const response = await axios.get(`/api/enhanced/groups/${groupId}`);
      setGroup(response.data.group);
      setFilteredMembers(response.data.group.members);
    } catch (error) {
      toast.error('Failed to load group data');
    }
  };

  const loadGroupMessages = async () => {
    try {
      const response = await axios.get(`/api/enhanced/groups/${groupId}/messages`);
      setMessages(response.data.messages || []);
    } catch (error) {
      toast.error('Failed to load group messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(`/api/enhanced/groups/${groupId}/messages`, {
        senderId: userInfo.id,
        message: newMessage,
        type: 'text'
      });

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.message]);
        setNewMessage('');
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) return;

    try {
      const promises = selectedMembers.map(memberId =>
        axios.post(`/api/enhanced/groups/${groupId}/members`, {
          userId: memberId,
          role: 'member'
        })
      );

      await Promise.all(promises);
      toast.success('Members added successfully');
      setSelectedMembers([]);
      setShowAddMembers(false);
      loadGroupData();
    } catch (error) {
      toast.error('Failed to add members');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await axios.delete(`/api/enhanced/groups/${groupId}/members/${memberId}`);
      toast.success('Member removed successfully');
      loadGroupData();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleChangeRole = async (memberId, newRole) => {
    try {
      await axios.put(`/api/enhanced/groups/${groupId}/members/${memberId}`, {
        role: newRole
      });
      toast.success('Role updated successfully');
      loadGroupData();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleUpdateGroupInfo = async () => {
    try {
      const updateData = {};
      if (newGroupName.trim()) updateData.name = newGroupName.trim();
      if (newGroupDescription.trim()) updateData.description = newGroupDescription.trim();

      if (Object.keys(updateData).length === 0) return;

      await axios.put(`/api/enhanced/groups/${groupId}`, updateData);
      toast.success('Group updated successfully');
      setEditingName(false);
      setEditingDescription(false);
      setNewGroupName('');
      setNewGroupDescription('');
      loadGroupData();
    } catch (error) {
      toast.error('Failed to update group');
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;

    try {
      await axios.delete(`/api/enhanced/groups/${groupId}/members/${userInfo.id}`);
      toast.success('Left group successfully');
      onBack();
    } catch (error) {
      toast.error('Failed to leave group');
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;

    try {
      await axios.delete(`/api/enhanced/groups/${groupId}`);
      toast.success('Group deleted successfully');
      onBack();
    } catch (error) {
      toast.error('Failed to delete group');
    }
  };

  const handleMuteGroup = async (isMuted) => {
    try {
      await axios.post(`/api/enhanced/groups/${groupId}/mute`, {
        userId: userInfo.id,
        isMuted
      });
      toast.success(isMuted ? 'Group muted' : 'Group unmuted');
    } catch (error) {
      toast.error('Failed to update mute status');
    }
  };

  const handleArchiveGroup = async (isArchived) => {
    try {
      if (isArchived) {
        await axios.post('/api/enhanced/chats/archive', {
          userId: userInfo.id,
          groupId: groupId
        });
        toast.success('Group archived');
      } else {
        await axios.delete(`/api/enhanced/chats/archive/${groupId}`, {
          data: { userId: userInfo.id }
        });
        toast.success('Group unarchived');
      }
    } catch (error) {
      toast.error('Failed to update archive status');
    }
  };

  const generateInviteLink = async () => {
    try {
      const response = await axios.post(`/api/enhanced/groups/${groupId}/invite-link`);
      setShowInviteLink(true);
      // Copy to clipboard
      navigator.clipboard.writeText(response.data.inviteLink);
      toast.success('Invite link copied to clipboard');
    } catch (error) {
      toast.error('Failed to generate invite link');
    }
  };

  const isAdmin = group?.members.find(m => m.userId === userInfo.id)?.role === 'admin';
  const isCreator = group?.members.find(m => m.userId === userInfo.id)?.role === 'creator';
  const canManageMembers = isAdmin || isCreator;
  const canManageGroup = isCreator;

  if (!group) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Group Header */}
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="text-gray-400 hover:text-white">
                ←
              </button>
              <Avatar src={group.profilePicture} alt={group.name} />
              <div>
                <h2 className="text-white font-semibold">{group.name}</h2>
                <p className="text-gray-400 text-sm">
                  {group.members.length} members
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGroupInfo(!showGroupInfo)}
                className="p-2 text-gray-400 hover:text-white rounded"
              >
                <BsThreeDotsVertical />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((message) => (
            <EnhancedMessage
              key={message.id}
              message={message}
              isGroupChat={true}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 text-white px-3 py-2 rounded"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Group Info Sidebar */}
      {showGroupInfo && (
        <div className="w-80 bg-gray-900 border-l border-gray-700 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Group Info</h3>
              <button
                onClick={() => setShowGroupInfo(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Group Profile */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <Avatar src={group.profilePicture} alt={group.name} size="large" />
                {canManageGroup && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full">
                    <BsCamera className="text-white" />
                  </button>
                )}
              </div>
              <h4 className="text-white font-semibold mt-2">{group.name}</h4>
              <p className="text-gray-400 text-sm">{group.description || 'No description'}</p>
            </div>

            {/* Group Actions */}
            <div className="space-y-2 mb-6">
              {canManageGroup && (
                <button
                  onClick={() => setShowGroupSettings(true)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded hover:bg-gray-700"
                >
                  <BsGear />
                  <span>Group Settings</span>
                </button>
              )}
              
              <button
                onClick={generateInviteLink}
                className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded hover:bg-gray-700"
              >
                <BsLink />
                <span>Invite Link</span>
              </button>

              <button
                onClick={() => setShowAddMembers(true)}
                className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded hover:bg-gray-700"
              >
                <BsPersonPlus />
                <span>Add Members</span>
              </button>

              <button
                onClick={() => handleMuteGroup(true)}
                className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded hover:bg-gray-700"
              >
                <BsVolumeMute />
                <span>Mute Group</span>
              </button>

              <button
                onClick={() => handleArchiveGroup(true)}
                className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded hover:bg-gray-700"
              >
                <BsArchive />
                <span>Archive Group</span>
              </button>
            </div>

            {/* Members List */}
            <div>
              <h5 className="text-white font-semibold mb-3">Members ({group.members.length})</h5>
              <div className="space-y-2">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <Avatar src={member.user.profilePicture} alt={member.user.name} size="small" />
                      <div>
                        <p className="text-white text-sm">{member.user.name}</p>
                        <p className="text-gray-400 text-xs">{member.role}</p>
                      </div>
                    </div>
                    {canManageMembers && member.userId !== userInfo.id && (
                      <div className="flex gap-1">
                        {member.role === 'member' && (
                          <button
                            onClick={() => handleChangeRole(member.id, 'admin')}
                            className="p-1 text-blue-400 hover:text-blue-300"
                            title="Make Admin"
                          >
                            <BsShield />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                          title="Remove Member"
                        >
                          <BsPersonX />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Leave/Delete Group */}
            <div className="mt-6 space-y-2">
              <button
                onClick={handleLeaveGroup}
                className="w-full p-3 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Leave Group
              </button>
              {canManageGroup && (
                <button
                  onClick={handleDeleteGroup}
                  className="w-full p-3 bg-red-800 text-white rounded hover:bg-red-900"
                >
                  Delete Group
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Members Modal */}
      {showAddMembers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h3 className="text-white font-semibold mb-4">Add Members</h3>
            
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded mb-4"
            />

            <div className="space-y-2 mb-4">
              {filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers(prev => [...prev, member.id]);
                      } else {
                        setSelectedMembers(prev => prev.filter(id => id !== member.id));
                      }
                    }}
                  />
                  <Avatar src={member.profilePicture} alt={member.name} size="small" />
                  <span className="text-white">{member.name}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddMembers}
                disabled={selectedMembers.length === 0}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Add Selected
              </button>
              <button
                onClick={() => setShowAddMembers(false)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Settings Modal */}
      {showGroupSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-white font-semibold mb-4">Group Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Group Name</label>
                {editingName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="flex-1 bg-gray-700 text-white px-3 py-2 rounded"
                      placeholder={group.name}
                    />
                    <button
                      onClick={() => {
                        setEditingName(false);
                        setNewGroupName('');
                      }}
                      className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <span className="text-white">{group.name}</span>
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <BsPencil />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Description</label>
                {editingDescription ? (
                  <div className="flex gap-2">
                    <textarea
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      className="flex-1 bg-gray-700 text-white px-3 py-2 rounded"
                      placeholder={group.description || 'Add description...'}
                      rows="3"
                    />
                    <button
                      onClick={() => {
                        setEditingDescription(false);
                        setNewGroupDescription('');
                      }}
                      className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <span className="text-white">{group.description || 'No description'}</span>
                    <button
                      onClick={() => setEditingDescription(true)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <BsPencil />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUpdateGroupInfo}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowGroupSettings(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Link Modal */}
      {showInviteLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 text-center">
            <h3 className="text-white font-semibold mb-4">Invite Link</h3>
            <p className="text-gray-300 mb-4">Share this link with others to invite them to the group:</p>
            <div className="bg-gray-700 p-3 rounded mb-4 break-all">
              <code className="text-blue-400">https://yourapp.com/join/group123</code>
            </div>
            <button
              onClick={() => setShowInviteLink(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedGroupChat;
