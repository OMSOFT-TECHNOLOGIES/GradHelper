import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Info,
  Clock,
  CheckCircle,
  Check,
  Circle,
  Settings,
  Search,
  Archive,
  Star,
  VolumeX,
  Volume2,
  Image,
  File
} from 'lucide-react';
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'admin';
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: ChatAttachment[];
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isEdited?: boolean;
  replyTo?: string;
}

interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  preview?: string;
}

interface ChatViewProps {
  userRole?: 'student' | 'admin';
  user?: any;
}

export function ChatView({ userRole = 'student', user }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState('Just now');
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('gradhelper_chat_messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Initialize with default chat messages
      const defaultMessages = createDefaultChatMessages();
      setMessages(defaultMessages);
      localStorage.setItem('gradhelper_chat_messages', JSON.stringify(defaultMessages));
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    let typingTimer: NodeJS.Timeout;
    
    if (newMessage.length > 0) {
      setIsTyping(true);
      typingTimer = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    }
    
    return () => clearTimeout(typingTimer);
  }, [newMessage]);

  const createDefaultChatMessages = (): ChatMessage[] => {
    const currentUserId = user?.id || 'current-user';
    const currentUserName = user?.name || 'Current User';
    
    return [
      {
        id: '1',
        senderId: 'system',
        senderName: 'System',
        senderRole: 'admin',
        content: 'Chat session started. You are now connected with admin support.',
        type: 'system',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        status: 'delivered'
      },
      {
        id: '2',
        senderId: userRole === 'student' ? 'admin-1' : 'student-1',
        senderName: userRole === 'student' ? 'Dr. Sarah Wilson' : 'Emily Davis',
        senderRole: userRole === 'student' ? 'admin' : 'student',
        senderAvatar: userRole === 'student' 
          ? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face'
          : 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
        content: userRole === 'student' 
          ? 'Hello! Welcome to TheGradHelper support. How can I assist you today?'
          : 'Hi! I need some help with my machine learning project. Are you available?',
        type: 'text',
        timestamp: new Date(Date.now() - 3300000).toISOString(), // 55 minutes ago
        status: 'read'
      },
      {
        id: '3',
        senderId: userRole === 'student' ? currentUserId : 'admin-1',
        senderName: userRole === 'student' ? currentUserName : 'Dr. Sarah Wilson',
        senderRole: userRole,
        senderAvatar: userRole === 'student' ? user?.avatar : 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
        content: userRole === 'student'
          ? 'Hi! I have some questions about my ML project deliverables. Could you help me understand the requirements better?'
          : 'Of course! I\'d be happy to help with your machine learning project. What specific aspect would you like to discuss?',
        type: 'text',
        timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
        status: 'read'
      },
      {
        id: '4',
        senderId: userRole === 'student' ? 'admin-1' : currentUserId,
        senderName: userRole === 'student' ? 'Dr. Sarah Wilson' : currentUserName,
        senderRole: userRole === 'student' ? 'admin' : userRole,
        senderAvatar: userRole === 'student' 
          ? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face'
          : user?.avatar,
        content: userRole === 'student'
          ? 'Absolutely! I\'d be happy to help. Can you tell me which specific area you\'re working on? Is it data preprocessing, model selection, or something else?'
          : 'I\'m working on a classification problem but I\'m having trouble with feature selection. Could you guide me on the best approaches?',
        type: 'text',
        timestamp: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
        status: 'read'
      },
      {
        id: '5',
        senderId: userRole === 'student' ? currentUserId : 'admin-1',
        senderName: userRole === 'student' ? currentUserName : 'Dr. Sarah Wilson',
        senderRole: userRole === 'student' ? userRole : 'admin',
        senderAvatar: userRole === 'student' ? user?.avatar : 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
        content: userRole === 'student'
          ? 'I\'m mainly struggling with feature selection and model evaluation. I\'ve tried a few approaches but I\'m not getting the accuracy I expected.'
          : 'Great question! Feature selection is crucial for classification tasks. I recommend starting with correlation analysis and then trying techniques like Recursive Feature Elimination (RFE) or L1 regularization.',
        type: 'text',
        timestamp: new Date(Date.now() - 2400000).toISOString(), // 40 minutes ago
        status: 'read'
      },
      {
        id: '6',
        senderId: userRole === 'student' ? 'admin-1' : currentUserId,
        senderName: userRole === 'student' ? 'Dr. Sarah Wilson' : currentUserName,
        senderRole: userRole === 'student' ? 'admin' : userRole,
        senderAvatar: userRole === 'student' 
          ? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face'
          : user?.avatar,
        content: userRole === 'student'
          ? 'That sounds great! Could you help me understand how to implement RFE properly? I\'ve read about it but I\'m not sure about the practical implementation.'
          : 'I can definitely help with RFE implementation. Would you like me to share some code examples? Also, what\'s your dataset size and the number of features you\'re working with?',
        type: 'text',
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        status: 'delivered'
      }
    ];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const currentUserId = user?.id || 'current-user';
    const currentUserName = user?.name || 'Current User';

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: userRole || 'student',
      senderAvatar: user?.avatar,
      content: newMessage.trim(),
      type: 'text',
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem('gradhelper_chat_messages', JSON.stringify(updatedMessages));
    setNewMessage('');

    // Simulate message delivery
    setTimeout(() => {
      const deliveredMessage = { ...message, status: 'delivered' as const };
      const deliveredMessages = updatedMessages.map(m => 
        m.id === message.id ? deliveredMessage : m
      );
      setMessages(deliveredMessages);
      localStorage.setItem('gradhelper_chat_messages', JSON.stringify(deliveredMessages));
    }, 1000);

    // Simulate auto-response from admin (only for students)
    if (userRole === 'student') {
      setTimeout(() => {
        const autoResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          senderId: 'admin-1',
          senderName: 'Dr. Sarah Wilson',
          senderRole: 'admin',
          senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
          content: getAutoResponse(newMessage.trim()),
          type: 'text',
          timestamp: new Date().toISOString(),
          status: 'delivered'
        };

        setMessages(prevMessages => {
          const deliveredMessages = prevMessages.map(m => 
            m.id === message.id ? { ...m, status: 'delivered' as const } : m
          );
          const withResponse = [...deliveredMessages, autoResponse];
          localStorage.setItem('gradhelper_chat_messages', JSON.stringify(withResponse));
          return withResponse;
        });
      }, 2000);
    }

    toast.success('Message sent!');
  };

  const getAutoResponse = (userMessage: string): string => {
    const responses = [
      "Thank you for your message! I'll help you with that right away.",
      "That's a great question! Let me provide you with some detailed guidance.",
      "I understand your concern. Here's what I recommend...",
      "Perfect! I can definitely help you with this. Let me explain the best approach.",
      "Thanks for reaching out! I'll make sure to address all your questions thoroughly."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending': return Circle;
      case 'sent': return Check;
      case 'delivered': return CheckCircle;
      case 'read': return CheckCircle;
      default: return Circle;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const currentParticipant = userRole === 'student' 
    ? { name: 'Dr. Sarah Wilson', role: 'Academic Advisor' }
    : { name: 'Emily Davis', role: 'Computer Science Student' };

  return (
    <div className="chat-view">
      <Card className="chat-container h-[calc(100vh-12rem)] flex flex-col">
        {/* Chat Header */}
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="avatar w-10 h-10">
                  <img 
                    src={userRole === 'student' 
                      ? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
                      : 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
                    } 
                    alt={currentParticipant.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
              
              <div>
                <CardTitle className="text-base">{currentParticipant.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {currentParticipant.role}
                  {isOnline ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      Online
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-500">Last seen {lastSeen}</span>
                  )}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === (user?.id || 'current-user');
            const isSystemMessage = message.type === 'system';
            const StatusIcon = getStatusIcon(message.status);
            const showAvatar = !isCurrentUser && !isSystemMessage && 
              (index === 0 || messages[index - 1].senderId !== message.senderId);
            
            if (isSystemMessage) {
              return (
                <div key={message.id} className="system-message text-center py-2">
                  <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                    <Info className="w-3 h-3" />
                    {message.content}
                  </div>
                </div>
              );
            }
            
            return (
              <div
                key={message.id}
                className={`chat-message flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
              >
                <div className="avatar-container">
                  {showAvatar ? (
                    <div className="avatar w-8 h-8">
                      <img 
                        src={message.senderAvatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`} 
                        alt={message.senderName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8" />
                  )}
                </div>
                
                <div className={`message-bubble-container max-w-xs lg:max-w-md ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                  {showAvatar && !isCurrentUser && (
                    <span className="text-xs text-gray-500 mb-1 px-3">
                      {message.senderName}
                    </span>
                  )}
                  
                  <div className={`message-bubble ${
                    isCurrentUser 
                      ? 'bg-blue-600 text-white rounded-l-2xl rounded-tr-2xl' 
                      : 'bg-gray-100 text-gray-900 rounded-r-2xl rounded-tl-2xl'
                  } p-3 shadow-sm`}>
                    <p className="text-sm leading-relaxed">
                      {message.content}
                    </p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="attachments mt-2 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div 
                            key={attachment.id}
                            className={`attachment flex items-center gap-2 p-2 rounded ${
                              isCurrentUser ? 'bg-blue-700' : 'bg-gray-200'
                            }`}
                          >
                            <File className="w-4 h-4" />
                            <span className="text-xs font-medium truncate flex-1">
                              {attachment.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className={`flex items-center justify-between mt-2 text-xs ${
                      isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{formatTimestamp(message.timestamp)}</span>
                      {isCurrentUser && (
                        <StatusIcon className={`w-3 h-3 ${
                          message.status === 'read' ? 'text-blue-200' : 'text-blue-300'
                        }`} />
                      )}
                    </div>
                    
                    {message.isEdited && (
                      <div className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-200' : 'text-gray-400'
                      }`}>
                        (edited)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="typing-indicator flex gap-3">
              <div className="avatar w-8 h-8">
                <img 
                  src={userRole === 'student' 
                    ? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
                    : 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
                  } 
                  alt="Typing"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="typing-bubble bg-gray-100 rounded-r-2xl rounded-tl-2xl p-3">
                <div className="typing-dots flex gap-1">
                  <div className="dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>
        
        {/* Chat Input */}
        <div className="chat-input border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Button type="button" variant="ghost" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <Image className="w-4 h-4" />
            </Button>
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="button" variant="ghost" size="sm">
              <Smile className="w-4 h-4" />
            </Button>
            <Button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>
              {userRole === 'student' ? 'Admin Support' : 'Student'} is {isOnline ? 'online' : `last seen ${lastSeen}`}
            </span>
            {isTyping && (
              <span className="text-blue-600">
                {currentParticipant.name} is typing...
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}