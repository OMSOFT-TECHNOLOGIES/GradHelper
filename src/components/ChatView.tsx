import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Avatar } from './Avatar';
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
  File,
  Users,
  MessageCircle
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

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  subject: string;
  lastMessage?: string;
  lastMessageTime?: string;
  isOnline: boolean;
  unreadCount: number;
}

interface ChatViewProps {
  userRole?: 'student' | 'admin';
  user?: any;
}

export function ChatView({ userRole = 'student', user }: ChatViewProps) {
  // State and refs (all at top)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState('Just now');
  const [isMuted, setIsMuted] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Fetch admin profile for student sidebar
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [socketWarning, setSocketWarning] = useState<string | null>(null);

  // Fetch or create chat when selectedStudent changes (admin) or on mount (student)
  useEffect(() => {
    const fetchOrCreateChat = async () => {
      try {
        const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8000';
        const token = localStorage.getItem('gradhelper_token');
        
        // First, get list of existing chats
        const chatsResponse = await fetch(`${baseUrl}api/auth/live-chats/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!chatsResponse.ok) throw new Error('Failed to fetch chats');
        const chatsData = await chatsResponse.json();
        
        let currentChatId: string | null = null;
        
        if (userRole === 'admin' && selectedStudent) {
          // For admin: find existing chat with this student or create new one
          const existingChat = chatsData.chats?.find((chat: any) => 
            chat.participants?.some((p: any) => p.id === selectedStudent.id)
          );
          
          if (existingChat) {
            currentChatId = existingChat.id;
          } else {
            // Create new chat with student
            const createResponse = await fetch(`${baseUrl}api/auth/live-chats/`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                title: `Chat with ${selectedStudent.name}`,
                admin_id: user?.id,
                student_id: selectedStudent.id
              })
            });
            
            if (createResponse.ok) {
              const newChat = await createResponse.json();
              currentChatId = newChat.chat.id;
            }
          }
        } else if (userRole === 'student') {
          // For student: find existing chat or create new one
          const existingChat = chatsData.chats?.find((chat: any) => 
            chat.participants?.some((p: any) => p.id === user?.id)
          );
          
          if (existingChat) {
            currentChatId = existingChat.id;
          } else {
            // Create new chat for help
            const createResponse = await fetch(`${baseUrl}api/auth/live-chats/`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                title: 'Help with assignment'
              })
            });
            
            if (createResponse.ok) {
              const newChat = await createResponse.json();
              currentChatId = newChat.chat.id;
            }
          }
        }
        
        if (currentChatId) {
          setChatId(currentChatId);
          
          // Fetch messages for this chat
          let allMessages: any[] = [];
          let page = 1;
          let hasNext = true;
          
          while (hasNext) {
            const messagesResponse = await fetch(`${baseUrl}api/auth/live-chats/${currentChatId}/messages/?page=${page}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (messagesResponse.ok) {
              const messagesData = await messagesResponse.json();
              allMessages = [...allMessages, ...messagesData.results];
              hasNext = !!messagesData.next;
              page++;
            } else {
              hasNext = false;
            }
          }
          
          // Map backend messages to ChatMessage format
          const mappedMessages = allMessages.map((msg: any) => {
            // Ensure valid timestamp
            let validTimestamp = new Date().toISOString();
            if (msg.created_at) {
              const parsedDate = new Date(msg.created_at);
              if (!isNaN(parsedDate.getTime())) {
                validTimestamp = parsedDate.toISOString();
              }
            } else if (msg.timestamp) {
              const parsedDate = new Date(msg.timestamp);
              if (!isNaN(parsedDate.getTime())) {
                validTimestamp = parsedDate.toISOString();
              }
            }
            
            return {
              id: String(msg.id),
              senderId: String(msg.sender?.id || msg.sender),
              senderName: msg.sender?.name || msg.sender_name || '',
              senderRole: (userRole === 'admin'
                ? (String(msg.sender?.id || msg.sender) === String(selectedStudent?.id) ? 'student' : 'admin')
                : (String(msg.sender?.id || msg.sender) === String(user?.id) ? 'student' : 'admin')) as 'student' | 'admin',
              senderAvatar: msg.sender?.avatar || '',
              content: msg.content,
              type: (msg.type || 'text') as 'text' | 'image' | 'file' | 'system',
              attachments: msg.attachments || [],
              timestamp: validTimestamp,
              status: (msg.is_read ? 'read' : 'delivered') as 'sending' | 'sent' | 'delivered' | 'read',
              replyTo: msg.reply_to || null
            };
          });
          
          setMessages(mappedMessages);
          
          // Update student sidebar with last message when messages are loaded
          if (userRole === 'admin' && selectedStudent && mappedMessages.length > 0) {
            const lastMessage = mappedMessages[mappedMessages.length - 1];
            if (lastMessage && lastMessage.type !== 'system') {
              setStudents(prev => prev.map(student => 
                student.id === selectedStudent.id 
                  ? {
                      ...student,
                      lastMessage: lastMessage.content.length > 50 
                        ? lastMessage.content.substring(0, 50) + '...' 
                        : lastMessage.content,
                      lastMessageTime: formatTimestamp(lastMessage.timestamp)
                    }
                  : student
              ));
            }
          }
        } else {
          setChatId(null);
          setMessages([]);
        }
      } catch (err) {
        console.error('Failed to fetch/create chat:', err);
        setChatId(null);
      }
    };
    
    if ((userRole === 'admin' && selectedStudent) || userRole === 'student') {
      fetchOrCreateChat();
    }
  }, [userRole, selectedStudent, user?.id]);

  // Connect to WebSocket when chatId changes
  useEffect(() => {
    // WebSocket connection with heartbeat and auto-reconnect
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000;

    function connectWebSocket() {
      if (!chatId) {
        console.log('[WebSocket] No chatId available, skipping connection');
        return;
      }
      setSocketWarning(null);
      
      // Use environment variable or fallback
      const wsBaseUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
      const wsUrl = `${wsBaseUrl}/ws/chat/${chatId}/`;
      const token = localStorage.getItem('gradhelper_token');
      const fullWsUrl = token ? `${wsUrl}?token=${token}` : wsUrl;
      
      console.log('[WebSocket] Connecting to:', fullWsUrl);
      const ws = new WebSocket(fullWsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected to chat:', chatId, 'User:', user?.id, 'Role:', userRole);
        setIsOnline(true);
        setSocketWarning(null);
        reconnectAttempts = 0;
        
        // Send user identification
        ws.send(JSON.stringify({
          type: 'user_join',
          user_id: user?.id,
          user_role: userRole
        }));
        
        // Heartbeat: send ping every 20s
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 20000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.debug('[WebSocket] Received:', data);
          if (data.type === 'pong') {
            // Heartbeat response
            return;
          }
          if (data.type === 'message_sent') {
            // New message received
            const msg = data.message;
            const senderId = String(msg.sender?.id || msg.sender);
            const currentUserId = String(user?.id);
            
            console.log('[WebSocket] Message received from:', senderId, 'Current user:', currentUserId);
            
            // Ensure valid timestamp
            let validTimestamp = new Date().toISOString();
            if (msg.created_at) {
              const parsedDate = new Date(msg.created_at);
              if (!isNaN(parsedDate.getTime())) {
                validTimestamp = parsedDate.toISOString();
              }
            } else if (msg.timestamp) {
              const parsedDate = new Date(msg.timestamp);
              if (!isNaN(parsedDate.getTime())) {
                validTimestamp = parsedDate.toISOString();
              }
            }
            
            const mappedMsg = {
              id: String(msg.id),
              senderId: senderId,
              senderName: msg.sender?.name || msg.sender_name || '',
              senderRole: (userRole === 'admin'
                ? (senderId === String(selectedStudent?.id) ? 'student' : 'admin')
                : (senderId === currentUserId ? 'student' : 'admin')) as 'student' | 'admin',
              senderAvatar: msg.sender?.avatar || '',
              content: msg.content,
              type: msg.type || 'text',
              attachments: msg.attachments || [],
              timestamp: validTimestamp,
              status: (msg.is_read ? 'read' : 'delivered') as 'sending' | 'sent' | 'delivered' | 'read',
              replyTo: msg.reply_to || null
            };
            
            // Add message if it's not already in the list (avoid duplicates)
            setMessages((prev) => {
              // Check for duplicates by ID, content, and timestamp proximity
              const existingById = prev.find(m => m.id === mappedMsg.id);
              const existingByContent = prev.find(m => 
                m.content === mappedMsg.content && 
                m.senderId === mappedMsg.senderId &&
                Math.abs(new Date(m.timestamp).getTime() - new Date(mappedMsg.timestamp).getTime()) < 5000 // Within 5 seconds
              );
              const existingTemp = prev.find(m => 
                m.id.startsWith('temp-') && 
                m.content === mappedMsg.content && 
                m.senderId === mappedMsg.senderId
              );
              
              if (existingById) {
                // Message already exists by ID, don't add duplicate
                console.log('[WebSocket] Ignoring duplicate message by ID:', mappedMsg.id);
                return prev;
              }
              
              if (existingTemp) {
                // Replace temp message with real message
                console.log('[WebSocket] Replacing temp message with real message:', existingTemp.id, '->', mappedMsg.id);
                return prev.map(m => 
                  m.id === existingTemp.id ? { ...mappedMsg, status: 'delivered' } : m
                );
              }
              
              if (existingByContent) {
                // Similar message exists, likely a duplicate
                console.log('[WebSocket] Ignoring duplicate message by content and time');
                return prev;
              }
              
              console.log('[WebSocket] Adding new message:', mappedMsg.id);
              return [...prev, mappedMsg];
            });
            
            // Update student sidebar for admin view
            if (userRole === 'admin' && mappedMsg.type !== 'system') {
              const messageSenderId = mappedMsg.senderId;
              const isFromSelectedStudent = messageSenderId === String(selectedStudent?.id);
              
              setStudents(prev => prev.map(student => {
                if (student.id === messageSenderId || (isFromSelectedStudent && student.id === selectedStudent?.id)) {
                  return {
                    ...student,
                    lastMessage: mappedMsg.content.length > 50 
                      ? mappedMsg.content.substring(0, 50) + '...' 
                      : mappedMsg.content,
                    lastMessageTime: formatTimestamp(mappedMsg.timestamp),
                    unreadCount: isFromSelectedStudent && messageSenderId !== String(user?.id)
                      ? (student.unreadCount || 0) + 1
                      : 0
                  };
                }
                return student;
              }));
            }
            
            // Stop typing indicator when message is received
            setIsTyping(false);
          }
          if (data.type === 'message_edited') {
            // Message was edited
            const msg = data.message;
            setMessages((prev) => prev.map(m => 
              m.id === String(msg.id) 
                ? { ...m, content: msg.content, isEdited: true }
                : m
            ));
          }
          if (data.type === 'typing_status') {
            // Someone started/stopped typing
            const typingUserId = String(data.user?.id || data.user);
            const currentUserId = String(user?.id);
            
            // Only show typing indicator if it's not the current user
            if (typingUserId !== currentUserId) {
              if (data.is_typing) {
                setIsTyping(true);
                // Auto-hide typing indicator after 5 seconds as fallback
                setTimeout(() => setIsTyping(false), 5000);
              } else {
                setIsTyping(false);
              }
            }
          }
          if (data.type === 'user_status') {
            // User joined/left chat
            if (data.action === 'joined') {
              setIsOnline(true);
            } else if (data.action === 'left') {
              setIsOnline(false);
            }
          }
        } catch (err) {
          console.error('[WebSocket] Error parsing message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason);
        setIsOnline(false);
        setSocketWarning('Chat connection lost. Trying to reconnect...');
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        
        // Only attempt reconnection if not manually closed
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`[WebSocket] Reconnecting attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
          reconnectRef.current = setTimeout(connectWebSocket, reconnectDelay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          setSocketWarning('Unable to reconnect to chat. Please refresh the page.');
        }
      };

      ws.onerror = () => {
        setIsOnline(false);
        setSocketWarning('Chat connection error. Trying to reconnect...');
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          reconnectRef.current = setTimeout(connectWebSocket, reconnectDelay);
        } else {
          setSocketWarning('Unable to reconnect to chat. Please refresh the page.');
        }
      };
    }

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [chatId, userRole, selectedStudent]);
  // ...existing code...

  // Initialize students data for admin view
  useEffect(() => {
    if (userRole === 'admin') {
      const fetchStudents = async () => {
        try {
          const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8000';
          const token = localStorage.getItem('gradhelper_token');
          const response = await fetch(`${baseUrl}api/auth/admin/user-profiles`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (!response.ok) {
            throw new Error('Failed to fetch students');
          }
          const data = await response.json();
          // Map API response to Student type
          const studentsData: Student[] = data.map((item: any) => ({
            id: String(item.user_id),
            name: item.first_name + ' ' + item.last_name,
            email: item.email,
            avatar: '',
            subject: item.major || '',
            lastMessage: item.last_message || undefined,
            lastMessageTime: item.last_message_time ? formatTimestamp(item.last_message_time) : undefined,
            isOnline: item.is_online,
            unreadCount: item.unread_count || 0
          }));
          setStudents(studentsData);
          setSelectedStudent(studentsData[0] || null);
        } catch (error) {
          toast.error('Failed to fetch students');
        }
      };
      fetchStudents();
    }
  }, [userRole]);

  // Initialize with default messages only if no backend data
  useEffect(() => {
    if (messages.length === 0 && !chatId) {
      const defaultMessages = createDefaultChatMessages();
      setMessages(defaultMessages);
    }
  }, [selectedStudent, chatId]);

  // Update student sidebar when messages change
  useEffect(() => {
    if (userRole === 'admin' && messages.length > 0 && selectedStudent) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.type !== 'system') {
        setStudents(prev => prev.map(student => 
          student.id === selectedStudent.id 
            ? {
                ...student,
                lastMessage: lastMessage.content.length > 50 
                  ? lastMessage.content.substring(0, 50) + '...' 
                  : lastMessage.content,
                lastMessageTime: formatTimestamp(lastMessage.timestamp),
                unreadCount: lastMessage.senderId === selectedStudent.id 
                  ? (student.unreadCount || 0) + (lastMessage.status !== 'read' ? 1 : 0)
                  : 0 // Reset unread count for admin messages
              }
            : student
        ));
      }
    }
  }, [messages, selectedStudent, userRole]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Persist messages to localStorage after successful updates
  useEffect(() => {
    if (messages.length > 0) {
      const storageKey = userRole === 'admin' 
        ? `gradhelper_chat_messages_${selectedStudent?.id || 'default'}`
        : 'gradhelper_chat_messages';
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, userRole, selectedStudent]);

  // Handle typing indicators
  useEffect(() => {
    let typingTimer: NodeJS.Timeout | null = null;
    
    if (newMessage.length > 0 && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Send typing start via WebSocket with user context
      wsRef.current.send(JSON.stringify({ 
        type: 'typing_start',
        user_id: user?.id,
        user_name: user?.name,
        user_role: userRole
      }));
      
      // Clear previous timer
      if (typingTimer) clearTimeout(typingTimer);
      
      // Send typing stop after 1 second of no typing
      typingTimer = setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ 
            type: 'typing_stop',
            user_id: user?.id,
            user_name: user?.name,
            user_role: userRole
          }));
        }
      }, 1000);
    } else if (newMessage.length === 0 && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Send typing stop immediately when message is cleared
      wsRef.current.send(JSON.stringify({ 
        type: 'typing_stop',
        user_id: user?.id,
        user_name: user?.name,
        user_role: userRole
      }));
    }
    
    return () => {
      if (typingTimer) clearTimeout(typingTimer);
    };
  }, [newMessage, user?.id, user?.name, userRole]);

  // Mark chat as read when messages are loaded or chat is opened
  useEffect(() => {
    const markAsRead = async () => {
      if (chatId) {
        try {
          const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8000';
          const token = localStorage.getItem('gradhelper_token');
          
          await fetch(`${baseUrl}api/auth/live-chats/${chatId}/mark-read/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (error) {
          console.error('Failed to mark chat as read:', error);
        }
      }
    };

    if (chatId && messages.length > 0) {
      markAsRead();
    }
  }, [chatId, messages.length]);

  const createDefaultChatMessages = (): ChatMessage[] => {
    const currentUserId = user?.id || 'current-user';
    const currentUserName = user?.name || 'Current User';
    
    // Create conversation-specific messages for admin view
    if (userRole === 'admin' && selectedStudent) {
      return [
        {
          id: '1',
          senderId: 'system',
          senderName: 'System',
          senderRole: 'admin',
          content: `Chat session with ${selectedStudent.name} started.`,
          type: 'system',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'delivered'
        },
        {
          id: '2',
          senderId: selectedStudent.id,
          senderName: selectedStudent.name,
          senderRole: 'student',
          senderAvatar: '',
          content: `Hello! I'm working on my ${selectedStudent.subject} project and could use some guidance.`,
          type: 'text',
          timestamp: new Date(Date.now() - 3300000).toISOString(),
          status: 'read'
        },
        {
          id: '3',
          senderId: currentUserId,
          senderName: currentUserName,
          senderRole: 'admin',
          senderAvatar: '',
          content: `Hi ${selectedStudent.name}! I'd be happy to help with your ${selectedStudent.subject} project. What specific area do you need assistance with?`,
          type: 'text',
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          status: 'read'
        }
      ];
    }
    
    return [
      {
        id: '1',
        senderId: 'system',
        senderName: 'System',
        senderRole: 'admin',
        content: 'Chat session started. You are now connected with admin support.',
        type: 'system',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'delivered'
      },
      {
        id: '2',
        senderId: userRole === 'student' ? 'admin-1' : 'student-1',
        senderName: userRole === 'student' ? 'Dr. Sarah Wilson' : 'Emily Davis',
        senderRole: userRole === 'student' ? 'admin' : 'student',
        senderAvatar: '',
        content: userRole === 'student' 
          ? 'Hello! Welcome to TheGradHelper support. How can I assist you today?'
          : 'Hi! I need some help with my machine learning project. Are you available?',
        type: 'text',
        timestamp: new Date(Date.now() - 3300000).toISOString(),
        status: 'read'
      },
      {
        id: '3',
        senderId: userRole === 'student' ? currentUserId : 'admin-1',
        senderName: userRole === 'student' ? currentUserName : 'Dr. Sarah Wilson',
        senderRole: userRole,
        senderAvatar: '',
        content: userRole === 'student'
          ? 'Hi! I have some questions about my ML project deliverables. Could you help me understand the requirements better?'
          : 'Of course! I would be happy to help with your machine learning project. What specific aspect would you like to discuss?',
        type: 'text',
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        status: 'read'
      },
      {
        id: '4',
        senderId: userRole === 'student' ? 'admin-1' : currentUserId,
        senderName: userRole === 'student' ? 'Dr. Sarah Wilson' : currentUserName,
        senderRole: userRole === 'student' ? 'admin' : userRole,
        senderAvatar: '',
        content: userRole === 'student'
          ? 'Absolutely! I would be happy to help. Can you tell me which specific area you are working on? Is it data preprocessing, model selection, or something else?'
          : 'I am working on a classification problem but I am having trouble with feature selection. Could you guide me on the best approaches?',
        type: 'text',
        timestamp: new Date(Date.now() - 2700000).toISOString(),
        status: 'read'
      },
      {
        id: '5',
        senderId: userRole === 'student' ? currentUserId : 'admin-1',
        senderName: userRole === 'student' ? currentUserName : 'Dr. Sarah Wilson',
        senderRole: userRole === 'student' ? userRole : 'admin',
        senderAvatar: '',
        content: userRole === 'student'
          ? 'I am mainly struggling with feature selection and model evaluation. I have tried a few approaches but I am not getting the accuracy I expected.'
          : 'Great question! Feature selection is crucial for classification tasks. I recommend starting with correlation analysis and then trying techniques like Recursive Feature Elimination (RFE) or L1 regularization.',
        type: 'text',
        timestamp: new Date(Date.now() - 2400000).toISOString(),
        status: 'read'
      },
      {
        id: '6',
        senderId: userRole === 'student' ? 'admin-1' : currentUserId,
        senderName: userRole === 'student' ? 'Dr. Sarah Wilson' : currentUserName,
        senderRole: userRole === 'student' ? 'admin' : userRole,
        senderAvatar: '',
        content: userRole === 'student'
          ? 'That sounds great! Could you help me understand how to implement RFE properly? I have read about it but I am not sure about the practical implementation.'
          : 'I can definitely help with RFE implementation. Would you like me to share some code examples? Also, what is your dataset size and the number of features you are working with?',
        type: 'text',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: 'delivered'
      }
    ];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    const currentUserId = user?.id || 'current-user';
    const currentUserName = user?.name || 'Current User';
    const messageTimestamp = new Date().toISOString();
    
    // Create optimistic message for UI with unique temp ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tempMessage: ChatMessage = {
      id: tempId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: userRole || 'student',
      senderAvatar: '',
      content: messageContent,
      type: 'text',
      timestamp: messageTimestamp,
      status: 'sending'
    };

    // Optimistically add to UI
    setMessages(prev => {
      // Ensure no duplicate temp messages
      const hasRecentTemp = prev.some(m => 
        m.content === messageContent && 
        m.senderId === currentUserId &&
        m.id.startsWith('temp-') &&
        Date.now() - new Date(m.timestamp).getTime() < 1000 // Within 1 second
      );
      
      if (hasRecentTemp) {
        console.log('Preventing duplicate temp message');
        return prev;
      }
      
      return [...prev, tempMessage];
    });
    setNewMessage('');

    try {
      // First try to send via backend API
      const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8000';
      const token = localStorage.getItem('gradhelper_token');
      
      let recipientId;
      if (userRole === 'admin' && selectedStudent) {
        recipientId = selectedStudent.id;
      } else if (userRole === 'student') {
        // For students, send to admin (you may need to determine the admin ID)
        recipientId = '1'; // Default admin ID, adjust as needed
      }

      const payload = {
        content: messageContent,
        reply_to: null // Optional: ID of message to reply to
      };

      const response = await fetch(`${baseUrl}api/auth/live-chats/${chatId}/send-message/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const responseData = await response.json();
        
        // Ensure valid timestamp from response
        let responseTimestamp = messageTimestamp;
        if (responseData.createdAt) {
          const parsedDate = new Date(responseData.createdAt);
          if (!isNaN(parsedDate.getTime())) {
            responseTimestamp = parsedDate.toISOString();
          }
        } else if (responseData.timestamp) {
          const parsedDate = new Date(responseData.timestamp);
          if (!isNaN(parsedDate.getTime())) {
            responseTimestamp = parsedDate.toISOString();
          }
        }
        
        // Update the temp message with real data from backend
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? {
                ...msg,
                id: String(responseData.id),
                timestamp: responseTimestamp,
                status: 'sent'
              }
            : msg
        ));

        // Update student sidebar for admin view
        if (userRole === 'admin' && selectedStudent) {
          setStudents(prev => prev.map(student => 
            student.id === selectedStudent.id 
              ? {
                  ...student,
                  lastMessage: messageContent.length > 50 
                    ? messageContent.substring(0, 50) + '...' 
                    : messageContent,
                  lastMessageTime: 'Just now',
                  unreadCount: 0 // Reset unread count since admin just sent a message
                }
              : student
          ));
        }

        // Note: Don't send via WebSocket here as the backend API should handle WebSocket broadcasting
        // This prevents duplicate messages from appearing
        console.log('[API] Message sent successfully, ID:', responseData.id);

        toast.success('Message sent successfully!');
      } else {
        throw new Error(`Failed to send message: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send message via API:', error);
      
      // Mark message as failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, status: 'sending' }
          : msg
      ));

      // Try WebSocket as fallback
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          let recipientId;
          if (userRole === 'admin' && selectedStudent) {
            recipientId = selectedStudent.id;
          } else if (userRole === 'student') {
            recipientId = '1';
          }
          
          const socketMsg = {
            type: 'send_message',
            message: messageContent,
            reply_to: null
          };
          
          wsRef.current.send(JSON.stringify(socketMsg));
          
          // Update status to sent via WebSocket
          setMessages(prev => prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, status: 'sent' }
              : msg
          ));
          
          toast.warning('Message sent via WebSocket (API unavailable)');
        } catch (wsError) {
          console.error('WebSocket fallback failed:', wsError);
          
          // Mark as failed
          setMessages(prev => prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, status: 'sending' }
              : msg
          ));
          
          toast.error('Failed to send message. Please check your connection and try again.');
        }
      } else {
        toast.error('Unable to send message. Please check your connection.');
      }
    }
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

  const retryMessage = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    // Update status to sending
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status: 'sending' } : msg
    ));

    try {
      const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8000';
      const token = localStorage.getItem('gradhelper_token');
      
      let recipientId;
      if (userRole === 'admin' && selectedStudent) {
        recipientId = selectedStudent.id;
      } else if (userRole === 'student') {
        recipientId = '1';
      }

      const payload = {
        content: message.content,
        reply_to: message.replyTo || null
      };

      const response = await fetch(`${baseUrl}api/auth/api/live-chats/${chatId}/send-message/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const responseData = await response.json();
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? {
                ...msg,
                id: String(responseData.id),
                timestamp: responseData.createdAt || responseData.timestamp,
                status: 'sent'
              }
            : msg
        ));
        toast.success('Message sent successfully!');
      } else {
        throw new Error('Retry failed');
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'sending' } : msg
      ));
      toast.error('Failed to retry message. Please try again.');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    
    // Handle invalid dates
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return 'Just now';
    }
    
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

  const handleSelectStudent = (student: Student) => {
    if (selectedStudent?.id === student.id) return; // Don't reload if same student
    
    setSelectedStudent(student);
    // Mark messages as read
    const updatedStudents = students.map(s => 
      s.id === student.id ? { ...s, unreadCount: 0 } : s
    );
    setStudents(updatedStudents);
    
    // Clear typing indicator when switching students
    setIsTyping(false);
    setNewMessage('');
    
    toast.success(`Switched to conversation with ${student.name}`);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentParticipant = userRole === 'student' 
    ? { name: 'The Grad Helper', role: 'Admin' }
    : { 
        name: selectedStudent?.name || 'Select a student', 
        role: selectedStudent?.subject || 'Student'
      };

  return (
    <div className="h-full bg-white flex relative">
      {/* Connection Status Banner */}
      {socketWarning && (
        <div className="absolute top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 px-4 py-2 z-30">
          <div className="flex items-center justify-center">
            <Info className="w-4 h-4 text-amber-600 mr-2" />
            <span className="text-sm text-amber-800">{socketWarning}</span>
          </div>
        </div>
      )}
      
      <div className="flex h-full w-full">
        {/* Student Sidebar - Admin Only */}
        {userRole === 'admin' && (
          <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col sticky top-0 h-screen z-10">
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Users className="w-5 h-5" />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Student List - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-0">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className={`px-6 py-4 cursor-pointer transition-colors hover:bg-white ${
                      selectedStudent?.id === student.id 
                        ? 'bg-blue-50 border-r-2 border-r-blue-500' 
                        : 'border-b border-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {student.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-medium truncate ${
                            selectedStudent?.id === student.id ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {student.name}
                          </h3>
                          {student.lastMessageTime && (
                            <span className="text-xs text-gray-500 ml-2">
                              {student.lastMessageTime}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-500 truncate">
                            {student.lastMessage || 'No messages yet'}
                          </p>
                          {student.unreadCount > 0 && (
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center ml-2">
                              <span className="text-white text-xs font-medium">
                                {student.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {student.subject}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          {/* Chat Header - Sticky */}
          <div className="px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-20">
            {userRole === 'admin' && !selectedStudent ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-600">Select a student to start chatting</h3>
                  <p className="text-sm text-gray-500">Choose a student from the sidebar to begin the conversation</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Current conversation info */}
                  {userRole === 'admin' && selectedStudent ? (
                    <>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {selectedStudent.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{selectedStudent.name}</h2>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className={`w-2 h-2 rounded-full mr-2 ${selectedStudent.isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                          {selectedStudent.isOnline ? 'Online' : `Last seen ${selectedStudent.lastMessageTime || lastSeen}`}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Support Chat</h2>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                          Online
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Header Actions */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => toast.info("Search feature isn't available yet")}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => toast.info("Voice call feature isn't available yet")}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => toast.info("Video call feature isn't available yet")}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      setIsMuted(!isMuted);
                      toast.info(isMuted ? "Chat unmuted" : "Chat muted");
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => toast.info("Menu feature isn't available yet")}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Messages Area - Scrollable */}
          {userRole === 'admin' && !selectedStudent ? null : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message, index) => {
            // Fix alignment: sender messages on right, receiver on left
            // Fix alignment for both student and admin views
            let isCurrentUser: boolean;
            if (userRole === 'student') {
              isCurrentUser = message.senderId === String(user?.id);
            } else if (userRole === 'admin') {
              isCurrentUser = message.senderId !== String(selectedStudent?.id);
            } else {
              isCurrentUser = false;
            }
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
              <div key={message.id}>
                {/* Date separator */}
                {(index === 0 || formatTimestamp(messages[index - 1].timestamp) !== formatTimestamp(message.timestamp)) && (
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                )}
                
                {/* Message */}
                <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    {showAvatar && !isCurrentUser && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <span className="text-white text-xs font-medium">
                          {message.senderName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      } ${showAvatar ? '' : isCurrentUser ? 'mr-10' : 'ml-10'}`}
                    >
                      <p className="text-sm">{message.content}
</p>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div 
                              key={attachment.id}
                              className={`flex items-center gap-2 p-2 rounded ${
                                isCurrentUser ? 'bg-blue-600' : 'bg-gray-200'
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
                    </div>
                  </div>
                </div>
                
                {/* Message info */}
                <div className={`flex items-center mt-1 ${isCurrentUser ? 'justify-end mr-2' : 'justify-start ml-10'}`}>
                  <span className="text-xs text-gray-500 mr-1">
                    {formatTimestamp(message.timestamp)}
                  </span>
                  {isCurrentUser && (
                    <StatusIcon className={`w-3 h-3 ${
                      message.status === 'read' ? 'text-blue-500' : 
                      message.status === 'sending' ? 'text-orange-500' :
                      'text-gray-400'
                    }`} />
                  )}
                  {message.status === 'sending' && isCurrentUser && message.id.startsWith('temp-') && (
                    <button
                      onClick={() => retryMessage(message.id)}
                      className="text-xs text-blue-500 hover:text-blue-700 ml-2"
                    >
                      Retry
                    </button>
                  )}
                  {message.isEdited && (
                    <span className="text-xs text-gray-400 ml-1">
                      (edited)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-2xl ml-10">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
          
          {/* Message Input - Sticky */}
          {userRole === 'admin' && !selectedStudent ? null : (
            <div className="px-4 py-4 bg-white border-t border-gray-200 sticky bottom-0 z-20">
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
                
                <button
                  onClick={(e) => handleSendMessage(e)}
                  disabled={!newMessage.trim()}
                  className={`p-2 rounded-lg transition-colors ${
                    newMessage.trim()
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* Connection status info */}
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>
                  {userRole === 'student' ? 'Admin Support' : selectedStudent?.name || 'Student'} is {(userRole === 'admin' ? selectedStudent?.isOnline : isOnline) ? 'online' : `last seen ${lastSeen}`}
                </span>
                {isTyping && (
                  <span className="text-blue-600">
                    {userRole === 'admin' && selectedStudent ? selectedStudent.name : 'Support'} is typing...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}