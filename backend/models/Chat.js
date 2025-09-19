import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['customer', 'artisan', 'admin'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system', 'quote', 'order'],
      default: 'text'
    },
    attachments: [{
      type: {
        type: String,
        enum: ['image', 'document', 'link']
      },
      url: String,
      filename: String,
      size: Number
    }],
    metadata: {
      quotedMessage: {
        type: mongoose.Schema.Types.ObjectId
      },
      relatedOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      },
      relatedCustomization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customization'
      },
      relatedProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    editedAt: Date,
    isEdited: {
      type: Boolean,
      default: false
    }
  }],
  chatType: {
    type: String,
    enum: ['direct', 'group', 'support'],
    default: 'direct'
  },
  subject: String, // For customization discussions
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['product', 'order', 'customization', 'general']
    },
    entityId: mongoose.Schema.Types.ObjectId
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'closed'],
    default: 'active'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  settings: {
    isTypingEnabled: {
      type: Boolean,
      default: true
    },
    isFileUploadEnabled: {
      type: Boolean,
      default: true
    },
    maxFileSize: {
      type: Number,
      default: 10485760 // 10MB
    }
  }
}, {
  timestamps: true
});

// Update last activity on new message
chatSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastActivity = new Date();
  }
  next();
});

// Generate room ID for direct chats
chatSchema.statics.generateRoomId = function(userId1, userId2, entityId = null) {
  const users = [userId1, userId2].sort();
  let roomId = `${users[0]}_${users[1]}`;
  if (entityId) {
    roomId += `_${entityId}`;
  }
  return roomId;
};

// Find or create chat room
chatSchema.statics.findOrCreateRoom = async function(participants, chatType = 'direct', subject = null, relatedEntity = null) {
  let roomId;
  
  if (chatType === 'direct' && participants.length === 2) {
    const userIds = participants.map(p => p.user.toString()).sort();
    roomId = relatedEntity ? 
      `${userIds[0]}_${userIds[1]}_${relatedEntity.entityId}` : 
      `${userIds[0]}_${userIds[1]}`;
  } else {
    roomId = new mongoose.Types.ObjectId().toString();
  }

  let chat = await this.findOne({ roomId });
  
  if (!chat) {
    chat = new this({
      roomId,
      participants,
      chatType,
      subject,
      relatedEntity
    });
    await chat.save();
  }
  
  return chat;
};

// Indexes
chatSchema.index({ roomId: 1 });
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ 'messages.sender': 1 });
chatSchema.index({ 'messages.timestamp': -1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ status: 1 });

export default mongoose.model('Chat', chatSchema);