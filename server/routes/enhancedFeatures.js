import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow images, videos, documents
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|pdf|doc|docx|txt|xls|xlsx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Check if chat is archived
router.get('/chats/archive/check', async (req, res) => {
  try {
    const { userId, chatUserId } = req.query;
    
    const archivedChat = await prisma.archivedChat.findUnique({
      where: {
        userId_chatUserId: {
          userId: parseInt(userId),
          chatUserId: parseInt(chatUserId)
        }
      }
    });
    
    res.json({ success: true, isArchived: !!archivedChat });
  } catch (error) {
    console.error('Archive check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check if chat is muted
router.get('/chats/mute/check', async (req, res) => {
  try {
    const { userId, chatUserId } = req.query;
    
    const mutedChat = await prisma.mutedChat.findUnique({
      where: {
        userId_chatUserId: {
          userId: parseInt(userId),
          chatUserId: parseInt(chatUserId)
        }
      }
    });
    
    res.json({ success: true, isMuted: !!mutedChat });
  } catch (error) {
    console.error('Mute check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check if user is blocked
router.get('/users/block/check', async (req, res) => {
  try {
    const { userId, blockedUserId } = req.query;
    
    const blockedUser = await prisma.user.findFirst({
      where: {
        id: parseInt(userId),
        blockedUsers: {
          some: {
            id: parseInt(blockedUserId)
          }
        }
      }
    });
    
    res.json({ success: true, isBlocked: !!blockedUser });
  } catch (error) {
    console.error('Block check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get pinned messages for a chat
router.get('/messages/pinned', async (req, res) => {
  try {
    const { chatUserId } = req.query;
    
    const pinnedMessages = await prisma.messages.findMany({
      where: {
        OR: [
          { senderId: parseInt(chatUserId) },
          { receiverId: parseInt(chatUserId) }
        ],
        isPinned: true
      },
      include: {
        sender: true,
        receiver: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, pinnedMessages });
  } catch (error) {
    console.error('Pinned messages error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Message Reactions
router.post('/reactions', async (req, res) => {
  try {
    const { messageId, userId, reaction } = req.body;
    
    const existingReaction = await prisma.messageReaction.findUnique({
      where: { messageId_userId: { messageId: parseInt(messageId), userId: parseInt(userId) } }
    });

    if (existingReaction) {
      // Update existing reaction
      const updatedReaction = await prisma.messageReaction.update({
        where: { id: existingReaction.id },
        data: { reaction }
      });
      res.json({ success: true, reaction: updatedReaction });
    } else {
      // Create new reaction
      const newReaction = await prisma.messageReaction.create({
        data: { messageId: parseInt(messageId), userId: parseInt(userId), reaction }
      });
      res.json({ success: true, reaction: newReaction });
    }
  } catch (error) {
    console.error('Reaction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/reactions/:reactionId', async (req, res) => {
  try {
    const { reactionId } = req.params;
    await prisma.messageReaction.delete({ where: { id: parseInt(reactionId) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete reaction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reply Messages
router.post('/messages/reply', async (req, res) => {
  try {
    const { to, from, message, replyToMessageId } = req.body;
    
    const newMessage = await prisma.messages.create({
      data: {
        senderId: parseInt(from),
        receiverId: parseInt(to),
        messages: message,
        type: 'text',
        isReply: true,
        replyToMessageId: replyToMessageId ? parseInt(replyToMessageId) : null
      },
      include: {
        sender: true,
        receiver: true,
        replyToMessage: true
      }
    });
    
    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Reply message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Forward Messages
router.post('/messages/forward', async (req, res) => {
  try {
    const { to, from, originalMessageId } = req.body;
    
    const originalMessage = await prisma.messages.findUnique({
      where: { id: parseInt(originalMessageId) }
    });
    
    if (!originalMessage) {
      return res.status(404).json({ success: false, error: 'Original message not found' });
    }
    
    const forwardedMessage = await prisma.messages.create({
      data: {
        senderId: parseInt(from),
        receiverId: parseInt(to),
        messages: originalMessage.messages,
        type: originalMessage.type,
        isForwarded: true,
        forwardedFrom: originalMessage.senderId.toString(),
        metadata: originalMessage.metadata
      }
    });
    
    res.status(201).json({ success: true, message: forwardedMessage });
  } catch (error) {
    console.error('Forward message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete Messages
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    
    const message = await prisma.messages.findUnique({
      where: { id: parseInt(messageId) }
    });
    
    if (!message || message.senderId !== parseInt(userId)) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    
    await prisma.messages.update({
      where: { id: parseInt(messageId) },
      data: { isDeleted: true, deletedAt: new Date() }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pin Messages
router.post('/messages/:messageId/pin', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    
    const message = await prisma.messages.findUnique({
      where: { id: parseInt(messageId) }
    });
    
    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }
    
    // Check if user has permission to pin (sender or admin)
    if (message.senderId !== parseInt(userId)) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    
    await prisma.messages.update({
      where: { id: parseInt(messageId) },
      data: { isPinned: true }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Pin message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// File upload endpoint
router.post('/messages/upload', upload.single('file'), async (req, res) => {
  try {
    const { userId, receiverId, type, replyToMessageId } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const message = await prisma.messages.create({
      data: {
        senderId: parseInt(userId),
        receiverId: parseInt(receiverId),
        messages: `/uploads/${file.filename}`,
        type: type || 'document',
        metadata: {
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype
        },
        replyToMessageId: replyToMessageId ? parseInt(replyToMessageId) : null
      },
      include: {
        sender: true,
        receiver: true
      }
    });
    
    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Audio message upload
router.post('/messages/audio', upload.single('audio'), async (req, res) => {
  try {
    const { userId, receiverId, replyToMessageId } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ success: false, error: 'No audio file uploaded' });
    }
    
    const message = await prisma.messages.create({
      data: {
        senderId: parseInt(userId),
        receiverId: parseInt(receiverId),
        messages: `/uploads/${file.filename}`,
        type: 'audio',
        metadata: {
          fileName: file.originalname,
          fileSize: file.size,
          duration: 0 // You can extract this from the audio file
        },
        replyToMessageId: replyToMessageId ? parseInt(replyToMessageId) : null
      },
      include: {
        sender: true,
        receiver: true
      }
    });
    
    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Audio upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Location message
router.post('/messages/location', async (req, res) => {
  try {
    const { to, from, message, metadata, replyToMessageId } = req.body;
    
    const newMessage = await prisma.messages.create({
      data: {
        senderId: parseInt(from),
        receiverId: parseInt(to),
        messages: message,
        type: 'location',
        metadata: metadata || {},
        replyToMessageId: replyToMessageId ? parseInt(replyToMessageId) : null
      },
      include: {
        sender: true,
        receiver: true
      }
    });
    
    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Location message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Contact message
router.post('/messages/contact', async (req, res) => {
  try {
    const { to, from, message, replyToMessageId } = req.body;
    
    const newMessage = await prisma.messages.create({
      data: {
        senderId: parseInt(from),
        receiverId: parseInt(to),
        messages: message,
        type: 'contact',
        replyToMessageId: replyToMessageId ? parseInt(replyToMessageId) : null
      },
      include: {
        sender: true,
        receiver: true
      }
    });
    
    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Groups
router.post('/groups', async (req, res) => {
  try {
    const { name, description, creatorId, members } = req.body;
    
    const group = await prisma.group.create({
      data: {
        name,
        description,
        creatorId: parseInt(creatorId),
        inviteLink: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        members: {
          create: [
            {
              userId: parseInt(creatorId),
              role: 'creator'
            },
            ...members.map(memberId => ({
              userId: parseInt(memberId),
              role: 'member'
            }))
          ]
        }
      },
      include: {
        members: {
          include: { user: true }
        }
      }
    });
    
    res.status(201).json({ success: true, group });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) },
      include: {
        members: {
          include: { user: true }
        },
        messages: {
          include: { sender: true }
        }
      }
    });
    
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }
    
    res.json({ success: true, group });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Group Messages
router.post('/groups/:groupId/messages', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { senderId, message, type, metadata } = req.body;
    
    const newMessage = await prisma.messages.create({
      data: {
        senderId: parseInt(senderId),
        groupId: parseInt(groupId),
        messages: message,
        type: type || 'text',
        metadata: metadata || {}
      },
      include: {
        sender: true
      }
    });
    
    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Group message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add Member to Group
router.post('/groups/:groupId/members', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, role = 'member' } = req.body;
    
    const member = await prisma.groupMember.create({
      data: {
        groupId: parseInt(groupId),
        userId: parseInt(userId),
        role
      },
      include: { user: true }
    });
    
    res.status(201).json({ success: true, member });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove Member from Group
router.delete('/groups/:groupId/members/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    
    await prisma.groupMember.delete({
      where: { id: parseInt(memberId) }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Status/Stories
router.post('/status', upload.single('media'), async (req, res) => {
  try {
    const { userId, type, content, text } = req.body;
    
    let statusContent = content;
    if (req.file) {
      statusContent = `/uploads/${req.file.filename}`;
    }
    
    const status = await prisma.statusUpdate.create({
      data: {
        userId: parseInt(userId),
        content: statusContent,
        type: type || 'text',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });
    
    res.status(201).json({ success: true, status });
  } catch (error) {
    console.error('Create status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const statuses = await prisma.statusUpdate.findMany({
      where: {
        userId: parseInt(userId),
        expiresAt: { gt: new Date() }
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, statuses });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Call History
router.post('/calls', async (req, res) => {
  try {
    const { initiatorId, receiverId, callType, status, duration } = req.body;
    
    const call = await prisma.call.create({
      data: {
        initiatorId: parseInt(initiatorId),
        receiverId: parseInt(receiverId),
        callType,
        status,
        duration: duration ? parseInt(duration) : null
      }
    });
    
    res.status(201).json({ success: true, call });
  } catch (error) {
    console.error('Create call error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/calls/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const calls = await prisma.call.findMany({
      where: {
        OR: [
          { initiatorId: parseInt(userId) },
          { receiverId: parseInt(userId) }
        ]
      },
      include: {
        initiator: true,
        receiver: true
      },
      orderBy: { startedAt: 'desc' }
    });
    
    res.json({ success: true, calls });
  } catch (error) {
    console.error('Get calls error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// User Profile Updates
router.put('/users/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, about, status, profilePicture } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        name,
        about,
        status,
        profilePicture
      }
    });
    
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Privacy Settings
router.put('/users/:userId/privacy', async (req, res) => {
  try {
    const { userId } = req.params;
    const { lastSeen, profilePhoto, about, status } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        privacySettings: {
          lastSeen,
          profilePhoto,
          about,
          status
        }
      }
    });
    
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update privacy error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Notification Preferences
router.put('/users/:userId/notifications', async (req, res) => {
  try {
    const { userId } = req.params;
    const { messagePreview, groupNotifications, callNotifications, sound, vibration } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        notificationPreferences: {
          messagePreview,
          groupNotifications,
          callNotifications,
          sound,
          vibration
        }
      }
    });
    
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update notifications error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Theme Settings
router.put('/users/:userId/theme', async (req, res) => {
  try {
    const { userId } = req.params;
    const { theme, fontSize, chatWallpaper } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        theme,
        fontSize,
        chatWallpaper
      }
    });
    
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Archive Chat
router.post('/chats/archive', async (req, res) => {
  try {
    const { userId, chatUserId } = req.body;
    
    const archivedChat = await prisma.archivedChat.create({
      data: {
        userId: parseInt(userId),
        chatUserId: parseInt(chatUserId)
      }
    });
    
    res.json({ success: true, archivedChat });
  } catch (error) {
    console.error('Archive chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unarchive Chat
router.delete('/chats/archive/:chatUserId', async (req, res) => {
  try {
    const { chatUserId } = req.params;
    const { userId } = req.body;
    
    await prisma.archivedChat.delete({
      where: {
        userId_chatUserId: {
          userId: parseInt(userId),
          chatUserId: parseInt(chatUserId)
        }
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Unarchive chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mute Chat
router.post('/chats/mute', async (req, res) => {
  try {
    const { userId, chatUserId, mutedUntil, isPermanentlyMuted } = req.body;
    
    const mutedChat = await prisma.mutedChat.upsert({
      where: {
        userId_chatUserId: {
          userId: parseInt(userId),
          chatUserId: parseInt(chatUserId)
        }
      },
      update: {
        mutedUntil: mutedUntil ? new Date(mutedUntil) : null,
        isPermanentlyMuted: isPermanentlyMuted || false
      },
      create: {
        userId: parseInt(userId),
        chatUserId: parseInt(chatUserId),
        mutedUntil: mutedUntil ? new Date(mutedUntil) : null,
        isPermanentlyMuted: isPermanentlyMuted || false
      }
    });
    
    res.json({ success: true, mutedChat });
  } catch (error) {
    console.error('Mute chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unmute Chat
router.delete('/chats/mute/:chatUserId', async (req, res) => {
  try {
    const { chatUserId } = req.params;
    const { userId } = req.body;
    
    await prisma.mutedChat.delete({
      where: {
        userId_chatUserId: {
          userId: parseInt(userId),
          chatUserId: parseInt(chatUserId)
        }
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Unmute chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Block User
router.post('/users/block', async (req, res) => {
  try {
    const { userId, blockedUserId } = req.body;
    
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        blockedUsers: {
          connect: { id: parseInt(blockedUserId) }
        }
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unblock User
router.delete('/users/block/:blockedUserId', async (req, res) => {
  try {
    const { blockedUserId } = req.params;
    const { userId } = req.body;
    
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        blockedUsers: {
          disconnect: { id: parseInt(blockedUserId) }
        }
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Broadcast Lists
router.post('/broadcast', async (req, res) => {
  try {
    const { name, creatorId, members } = req.body;
    
    const broadcastList = await prisma.broadcastList.create({
      data: {
        name,
        creatorId: parseInt(creatorId),
        members: members.map(id => parseInt(id))
      }
    });
    
    res.status(201).json({ success: true, broadcastList });
  } catch (error) {
    console.error('Create broadcast error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send Broadcast Message
router.post('/broadcast/:broadcastId/message', async (req, res) => {
  try {
    const { broadcastId } = req.params;
    const { senderId, message, type, metadata } = req.body;
    
    const broadcastList = await prisma.broadcastList.findUnique({
      where: { id: parseInt(broadcastId) }
    });
    
    if (!broadcastList) {
      return res.status(404).json({ success: false, error: 'Broadcast list not found' });
    }
    
    // Send message to all members
    const messages = await Promise.all(
      broadcastList.members.map(memberId =>
        prisma.messages.create({
          data: {
            senderId: parseInt(senderId),
            receiverId: memberId,
            messages: message,
            type: type || 'text',
            metadata: metadata || {}
          }
        })
      )
    );
    
    res.status(201).json({ success: true, messages });
  } catch (error) {
    console.error('Broadcast message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Call Recording
router.post('/calls/:callId/record', async (req, res) => {
  try {
    const { callId } = req.params;
    const { recordingUrl, duration, fileSize } = req.body;
    
    const recording = await prisma.callRecording.create({
      data: {
        callId: parseInt(callId),
        recordingUrl,
        duration: parseInt(duration),
        fileSize: parseInt(fileSize)
      }
    });
    
    // Update call to mark as recorded
    await prisma.call.update({
      where: { id: parseInt(callId) },
      data: { isRecorded: true, recordingUrl }
    });
    
    res.status(201).json({ success: true, recording });
  } catch (error) {
    console.error('Call recording error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Message Search with Filters
router.get('/messages/search', async (req, res) => {
  try {
    const { userId, query, type, senderId, startDate, endDate, limit = 50 } = req.query;
    
    let whereClause = {
      OR: [
        { senderId: parseInt(userId) },
        { receiverId: parseInt(userId) }
      ]
    };
    
    if (query) {
      whereClause.messages = { contains: query, mode: 'insensitive' };
    }
    
    if (type && type !== 'all') {
      whereClause.type = type;
    }
    
    if (senderId) {
      whereClause.senderId = parseInt(senderId);
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }
    
    const messages = await prisma.messages.findMany({
      where: whereClause,
      include: {
        sender: true,
        receiver: true
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Message search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export Chat History
router.get('/chats/:chatUserId/export', async (req, res) => {
  try {
    const { chatUserId } = req.params;
    const { userId, format = 'json' } = req.query;
    
    const messages = await prisma.messages.findMany({
      where: {
        OR: [
          { senderId: parseInt(userId), receiverId: parseInt(chatUserId) },
          { senderId: parseInt(chatUserId), receiverId: parseInt(userId) }
        ]
      },
      include: {
        sender: true,
        receiver: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    if (format === 'json') {
      res.json({ success: true, messages });
    } else {
      // CSV format
      const csv = messages.map(msg => 
        `${msg.createdAt},${msg.sender.name},${msg.type},${msg.messages}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="chat-history.csv"');
      res.send(csv);
    }
  } catch (error) {
    console.error('Export chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
