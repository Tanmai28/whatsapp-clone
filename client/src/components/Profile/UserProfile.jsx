import React, { useState, useEffect } from 'react';
import { useStateProvider } from "@/context/StateContext";
import { BsCamera, BsGear, BsShield, BsBell, BsPalette, BsGlobe } from "react-icons/bs";
import { MdEdit, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FaCrown, FaUserFriends } from "react-icons/fa";

const UserProfile = ({ onClose }) => {
  const [{ userInfo }] = useStateProvider();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userInfo?.name || '',
    about: userInfo?.about || '',
    status: userInfo?.status || 'Hey there! I\'m using WhatsApp'
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    about: 'everyone',
    status: 'everyone'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    messagePreview: true,
    groupNotifications: true,
    callNotifications: true,
    sound: true,
    vibration: true
  });
  
  const [themeSettings, setThemeSettings] = useState({
    theme: 'dark',
    chatWallpaper: '',
    fontSize: 'medium'
  });

  const handleProfileUpdate = async () => {
    try {
      // API call to update profile
      console.log('Updating profile:', profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePrivacyUpdate = async () => {
    try {
      // API call to update privacy settings
      console.log('Updating privacy:', privacySettings);
    } catch (error) {
      console.error('Error updating privacy:', error);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      // API call to update notification settings
      console.log('Updating notifications:', notificationSettings);
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  const handleThemeUpdate = async () => {
    try {
      // API call to update theme settings
      console.log('Updating theme:', themeSettings);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mb-4">
            {userInfo?.profileImage ? (
              <img src={userInfo.profileImage} alt="Profile" className="w-full h-full rounded-full" />
            ) : (
              <span className="text-3xl text-white">{userInfo?.name?.charAt(0)}</span>
            )}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full hover:bg-blue-700">
            <BsCamera className="text-white" />
          </button>
        </div>
        
        {isEditing ? (
          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="w-full p-2 bg-gray-700 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">About</label>
              <textarea
                value={profileData.about}
                onChange={(e) => setProfileData({...profileData, about: e.target.value})}
                className="w-full p-2 bg-gray-700 rounded text-white"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Status</label>
              <input
                type="text"
                value={profileData.status}
                onChange={(e) => setProfileData({...profileData, status: e.target.value})}
                className="w-full p-2 bg-gray-700 rounded text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleProfileUpdate}
                className="flex-1 p-2 bg-blue-600 rounded hover:bg-blue-700 text-white"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 p-2 bg-gray-600 rounded hover:bg-gray-700 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-medium text-white mb-2">{profileData.name}</h3>
            <p className="text-gray-300 mb-2">{profileData.about}</p>
            <p className="text-gray-400 text-sm">{profileData.status}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              <MdEdit className="text-blue-400" />
              <span className="text-white">Edit Profile</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white mb-4">Privacy Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
          <div className="flex items-center gap-3">
            <MdVisibility className="text-blue-400" />
            <div>
              <p className="text-white">Last Seen</p>
              <p className="text-sm text-gray-400">Who can see your last seen</p>
            </div>
          </div>
          <select
            value={privacySettings.lastSeen}
            onChange={(e) => setPrivacySettings({...privacySettings, lastSeen: e.target.value})}
            className="bg-gray-600 text-white px-3 py-1 rounded"
          >
            <option value="everyone">Everyone</option>
            <option value="contacts">My Contacts</option>
            <option value="nobody">Nobody</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
          <div className="flex items-center gap-3">
            <MdVisibility className="text-green-400" />
            <div>
              <p className="text-white">Profile Photo</p>
              <p className="text-sm text-gray-400">Who can see your profile photo</p>
            </div>
          </div>
          <select
            value={privacySettings.profilePhoto}
            onChange={(e) => setPrivacySettings({...privacySettings, profilePhoto: e.target.value})}
            className="bg-gray-600 text-white px-3 py-1 rounded"
          >
            <option value="everyone">Everyone</option>
            <option value="contacts">My Contacts</option>
            <option value="nobody">Nobody</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
          <div className="flex items-center gap-3">
            <MdVisibility className="text-yellow-400" />
            <div>
              <p className="text-white">About</p>
              <p className="text-sm text-gray-400">Who can see your about</p>
            </div>
          </div>
          <select
            value={privacySettings.about}
            onChange={(e) => setPrivacySettings({...privacySettings, about: e.target.value})}
            className="bg-gray-600 text-white px-3 py-1 rounded"
          >
            <option value="everyone">Everyone</option>
            <option value="contacts">My Contacts</option>
            <option value="nobody">Nobody</option>
          </select>
        </div>

        <button
          onClick={handlePrivacyUpdate}
          className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700 text-white"
        >
          Save Privacy Settings
        </button>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white mb-4">Notification Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
          <div className="flex items-center gap-3">
            <BsBell className="text-blue-400" />
            <div>
              <p className="text-white">Message Preview</p>
              <p className="text-sm text-gray-400">Show message content in notifications</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notificationSettings.messagePreview}
            onChange={(e) => setNotificationSettings({...notificationSettings, messagePreview: e.target.checked})}
            className="w-5 h-5 text-blue-600 bg-gray-600 rounded"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
          <div className="flex items-center gap-3">
            <FaUserFriends className="text-green-400" />
            <div>
              <p className="text-white">Group Notifications</p>
              <p className="text-sm text-gray-400">Receive notifications for group messages</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notificationSettings.groupNotifications}
            onChange={(e) => setNotificationSettings({...notificationSettings, groupNotifications: e.target.checked})}
            className="w-5 h-5 text-blue-600 bg-gray-600 rounded"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
          <div className="flex items-center gap-3">
            <BsBell className="text-yellow-400" />
            <div>
              <p className="text-white">Sound</p>
              <p className="text-sm text-gray-400">Play sound for notifications</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notificationSettings.sound}
            onChange={(e) => setNotificationSettings({...notificationSettings, sound: e.target.checked})}
            className="w-5 h-5 text-blue-600 bg-gray-600 rounded"
          />
        </div>

        <button
          onClick={handleNotificationUpdate}
          className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700 text-white"
        >
          Save Notification Settings
        </button>
      </div>
    </div>
  );

  const renderThemeTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white mb-4">Theme & Appearance</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
          <div className="flex items-center gap-3">
            <BsPalette className="text-purple-400" />
            <div>
              <p className="text-white">Theme</p>
              <p className="text-sm text-gray-400">Choose your preferred theme</p>
            </div>
          </div>
          <select
            value={themeSettings.theme}
            onChange={(e) => setThemeSettings({...themeSettings, theme: e.target.value})}
            className="bg-gray-600 text-white px-3 py-1 rounded"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
          <div className="flex items-center gap-3">
            <BsPalette className="text-blue-400" />
            <div>
              <p className="text-white">Font Size</p>
              <p className="text-sm text-gray-400">Adjust text size</p>
            </div>
          </div>
          <select
            value={themeSettings.fontSize}
            onChange={(e) => setThemeSettings({...themeSettings, fontSize: e.target.value})}
            className="bg-gray-600 text-white px-3 py-1 rounded"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
          <div className="flex items-center gap-3">
            <BsPalette className="text-green-400" />
            <div>
              <p className="text-white">Chat Wallpaper</p>
              <p className="text-sm text-gray-400">Customize chat background</p>
            </div>
          </div>
          <button className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-white text-sm">
            Choose
          </button>
        </div>

        <button
          onClick={handleThemeUpdate}
          className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700 text-white"
        >
          Save Theme Settings
        </button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FaCrown />, content: renderProfileTab() },
    { id: 'privacy', label: 'Privacy', icon: <BsShield />, content: renderPrivacyTab() },
    { id: 'notifications', label: 'Notifications', icon: <BsBell />, content: renderNotificationsTab() },
    { id: 'theme', label: 'Theme', icon: <BsPalette />, content: renderThemeTab() }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-panel-header-background rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Profile & Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-700 p-1 rounded">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {tabs.find(tab => tab.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
