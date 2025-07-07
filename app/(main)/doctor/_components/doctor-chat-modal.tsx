"use client"

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Card, CardContent } from '../../../../components/ui/card';
import { User, Bot, Send, X, Loader2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { sendMessage, getChatHistory, convertClerkIdToUuuid } from '@/actions/message';
import { checkUser } from '@/lib/checkUser';

const SOCKET_URL = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || "http://localhost:3002"; // Use environment variable for production

interface DoctorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: any;
  patient: any;
  chatRoomId: string;
}

interface Message {
  role: 'doctor' | 'patient';
  content: string;
  timestamp: string; // ISO string for easier transport
  senderName?: string;
  senderId?: string;
}

export default function DoctorChatModal({ isOpen, onClose, doctor, patient, chatRoomId }: DoctorChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // here doctor is coming from props will give clerkId

  // Load chat history from DB when modal opens
  useEffect(() => {
    if (!isOpen || !chatRoomId) return;
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const history = await getChatHistory(chatRoomId);
        // console.log("doctorid is:",doctor.id);
        const doctorUUID = await convertClerkIdToUuuid(doctor.id);
        // doctor.id = doctorUUID;
        const formatted: Message[] = history.map((msg: any) => ({
          role: msg.senderId === doctorUUID ? 'doctor' : 'patient',
          content: msg.content,
          timestamp: new Date(msg.createdAt).toISOString(),
          senderName: (msg.senderId === doctorUUID ? 'You' : (msg.sender?.name|| patient?.name || 'Patient')),
          senderId: msg.senderId,
        }));
        // console.log(formatted);
        setMessages(formatted);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadHistory();
  }, [isOpen, chatRoomId, doctor.id, patient?.name]);

  // Connect to Socket.IO and join room when modal opens
  useEffect(() => {
    if (!isOpen || !chatRoomId) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit("joinRoom", { chatRoomId });

    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit("leaveRoom", { chatRoomId });
      socket.disconnect();
    };
  }, [isOpen, chatRoomId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message: real-time (Socket.IO) + persist to DB
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !socketRef.current || !chatRoomId || !doctor?.id) return;
    setIsLoading(true);
    const msg: Message = {
      role: 'doctor',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      senderName: doctor.name,
      senderId: doctor.id,
    };
    try {
      // Emit real-time message
      socketRef.current.emit("sendMessage", { chatRoomId, message: msg });
      // Persist to DB
      await sendMessage({
        chatRoomId,
        senderId: doctor.id,
        messageType: 'TEXT',
        content: inputMessage.trim(),
      });
      setMessages(prev => [...prev, msg]);
      setInputMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to format date for separator
  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Doctor-specific chat heading and context
  const chatHeading = `Reply to ${patient?.name || 'Patient'}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 bg-white dark:bg-slate-900 border border-border dark:border-slate-700">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-border dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {chatHeading}
                </DialogTitle>
              </div>
            </div>
          </div>
        </DialogHeader>
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-slate-900 hide-scrollbar-desktop">
          {isLoadingHistory ? (
            <div className="text-center text-gray-400 mt-10">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading chat history...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">No messages yet. Start the conversation!</div>
          ) : (
            <div className="space-y-4">
              {(() => {
                let lastDate: string | null = null;
                return messages.map((message, index) => {
                  const messageDate = formatDate(message.timestamp);
                  const showDate = messageDate !== lastDate;
                  lastDate = messageDate;
                  return (
                    <div key={`msg-group-${messageDate}-${index}`}>
                      {showDate && (
                        <div key={`date-${messageDate}-${index}`} className="flex justify-center my-2">
                          <span className="px-4 py-1 rounded-full text-xs font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shadow-sm">
                            {messageDate}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex ${message.role === 'doctor' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${message.role === 'doctor' ? 'order-2' : 'order-1'}`}>
                          <Card className={`${message.role === 'doctor' ? 'bg-blue-500 dark:bg-blue-600 text-white' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700'}`}>
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                {message.role !== 'doctor' && (
                                  <User className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <div className={`font-bold text-xs mb-1 ${message.role ==='doctor' ? 'text-white/80' : 'text-blue-500 dark:text-blue-400'}`}>
                                    {message.role === 'doctor' ? 'YOU' : (patient?.name || 'PATIENT')}
                                  </div>
                                  <p className="text-sm whitespace-pre-wrap">
                                    {message.content}
                                  </p>
                                  <p className={`text-xs mt-2 ${message.role === 'doctor' ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {formatTime(message.timestamp)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        {/* Input area */}
        <div className="p-4 border-t bg-white dark:bg-zinc-900 rounded-b-2xl">
          <div className="flex gap-2  items-center">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your reply..."
              disabled={isLoading || isLoadingHistory}
              className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-0 focus:ring-2   rounded-full px-4 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || isLoadingHistory}
              size="sm"
              className="rounded-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-md transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 