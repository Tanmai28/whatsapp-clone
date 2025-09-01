import React, { useState, useEffect } from 'react';
import { useStateProvider } from "@/context/StateContext";
import { BsThreeDotsVertical, BsPersonPlus, BsGear, BsLink45Deg } from "react-icons/bs";
import { MdGroup, MdExitToApp, MdAdminPanelSettings } from "react-icons/md";
import { FaCrown } from "react-icons/fa";

const GroupChat = ({ group, onClose }) => {
  const [{ userInfo }] = useStateProvider();
  const [showMembers, setShowMembers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [groupDescription, setGroupDescription] = useState(group?.description || '');
  const [groupName, setGroupName] = useState(group?.name || '');

  const isAdmin = group?.members?.find(m => m.userId === userInfo.id)?.role === 'admin';
  const isCreator = group?.creatorId === userInfo.id;

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;
    
    try {
      // API call to add member
      console.log('Adding member:', newMemberEmail);
      setNewMemberEmail('');
      setShowInvite(false);
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      // API call to remove member
      console.log('Removing member:', memberId);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleChangeRole = async (memberId, newRole) => {
    try {
      // API call to change role
      console.log('Changing role:', memberId, newRole);
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      // API call to leave group
      console.log('Leaving group');
      onClose();
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const handleUpdateGroup = async () => {
    try {
      // API call to update group
      console.log('Updating group:', { name: groupName, description: groupDescription });
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const generateInviteLink = () => {
    const link = `${window.location.origin}/join/${group?.inviteLink || group?.id}`;
    setInviteLink(link);
    setShowInvite(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-panel-header-background rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Group Info</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Group Info */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
              {group?.profilePicture ? (
                <img src={group.profilePicture} alt="Group" className="w-full h-full rounded-full" />
              ) : (
                <MdGroup className="text-2xl text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">{group?.name}</h3>
              <p className="text-sm text-gray-400">{group?.members?.length || 0} members</p>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm mb-4">
            {group?.description || 'No description'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <MdGroup className="text-xl text-blue-400" />
            <span className="text-white">View Members</span>
          </button>

          <button
            onClick={generateInviteLink}
            className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <BsLink45Deg className="text-xl text-green-400" />
            <span className="text-white">Invite Link</span>
          </button>

          {(isAdmin || isCreator) && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <BsGear className="text-xl text-yellow-400" />
              <span className="text-white">Group Settings</span>
            </button>
          )}

          <button
            onClick={handleLeaveGroup}
            className="flex items-center gap-3 p-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <MdExitToApp className="text-xl text-white" />
            <span className="text-white">Leave Group</span>
          </button>
        </div>

        {/* Members List */}
        {showMembers && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-white mb-4">Members</h4>
            <div className="space-y-3">
              {group?.members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      {member.user?.profilePicture ? (
                        <img src={member.user.profilePicture} alt="Profile" className="w-full h-full rounded-full" />
                      ) : (
                        <span className="text-sm text-white">{member.user?.name?.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm">{member.user?.name}</p>
                      <div className="flex items-center gap-2">
                        {member.role === 'creator' && <FaCrown className="text-yellow-400 text-xs" />}
                        {member.role === 'admin' && <MdAdminPanelSettings className="text-blue-400 text-xs" />}
                        <span className="text-xs text-gray-400 capitalize">{member.role}</span>
                      </div>
                    </div>
                  </div>
                  
                  {(isAdmin || isCreator) && member.userId !== userInfo.id && (
                    <div className="flex gap-2">
                      {member.role === 'member' && (
                        <button
                          onClick={() => handleChangeRole(member.id, 'admin')}
                          className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Make Admin
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Group Settings */}
        {showSettings && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-white mb-4">Group Settings</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Description</label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded text-white"
                  rows="3"
                />
              </div>
              <button
                onClick={handleUpdateGroup}
                className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700 text-white"
              >
                Update Group
              </button>
            </div>
          </div>
        )}

        {/* Invite Section */}
        {showInvite && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-white mb-4">Invite Members</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Invite Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 p-2 bg-gray-700 rounded text-white"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(inviteLink)}
                    className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Add by Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="Enter email"
                    className="flex-1 p-2 bg-gray-700 rounded text-white"
                  />
                  <button
                    onClick={handleAddMember}
                    className="px-3 py-2 bg-green-600 rounded hover:bg-green-700 text-white text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChat;
