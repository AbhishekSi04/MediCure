'use client'

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Loader2,
  AlertCircle,
  Stethoscope,
  History
} from 'lucide-react';
import { sendChatMessage, ChatMessage } from '@/actions/chatbot';
import { toast } from 'sonner';
import { getChatHistory } from '@/actions/chatbot';
import { useUser } from '@clerk/nextjs';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatMessage[] | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, history, showHistory]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Fetch previous chat history
  const handleFetchHistory = async () => {
    if (!user?.id) {
      toast.error('You must be signed in to view chat history.');
      return;
    }
    setIsLoading(true);
    try {
      const prevChats = await getChatHistory(user.id);
      setHistory(prevChats);
      setShowHistory(true);
    } catch (err) {
      toast.error('Failed to load previous chats.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    try {
      const response = await sendChatMessage(inputMessage.trim(), messages);
      if (response.error) {
        setError(response.error);
        toast.error(response.error);
      } else {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      const errorMessage = 'Failed to send message. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getQuickQuestions = () => [
    "What are the symptoms of a common cold?",
    "How can I improve my sleep quality?",
    "What foods are good for heart health?",
    "When should I see a doctor for a headache?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0">
        {/* Header with Previous Chats button */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Health Assistant
                </DialogTitle>
                <p className="text-sm text-gray-600">
                  Ask me about health-related questions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchHistory}
                className="h-8 px-2"
              >
                <History className="h-4 w-4 mr-1" />
                Previous Chats
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Previous Chat History Section */}
        {showHistory && history && (
          <div className="flex-1 overflow-y-auto p-4 border-b bg-gray-50 rounded-b-none rounded-t-md mb-2">
            <div className="flex justify-between items-center mb-2">
              <div className="w-6"/> {/* Spacer for centering title */}
              <div className="text-center text-xs text-gray-500 font-semibold">Previous Chats</div>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="h-6 w-6 p-0 rounded-full">
                <X className="h-3 w-3" />
              </Button>
            </div>
            {history.length === 0 ? (
              <div className="text-center text-gray-400">No previous chats found.</div>
            ) : (
              <div className="space-y-3">
                {history.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                      <Card className={`${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            {msg.role === 'assistant' && (
                              <Bot className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <div className="font-bold text-xs mb-1">
                                {msg.role === 'user' ? 'YOU' : 'BOT'}
                              </div>
                              <p className="text-sm whitespace-pre-wrap">
                                {msg.content}
                              </p>
                              <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                {formatTime(msg.timestamp)}
                              </p>
                            </div>
                            {msg.role === 'user' && (
                              <User className="h-4 w-4 text-blue-100 mt-0.5 flex-shrink-0" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Main chat area (scrollable) */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* If no messages, show welcome and quick questions */}
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to Health Assistant
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                I'm here to help with general health questions. Remember, I'm not a substitute for professional medical advice.
              </p>
              {/* Quick Questions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Try asking:
                </p>
                {getQuickQuestions().map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto p-3"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            // Render chat messages
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <Card className={`${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          {message.role === 'assistant' && (
                            <Bot className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="font-bold text-xs mb-1">
                              {message.role === 'user' ? 'YOU' : 'BOT'}
                            </div>
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                          {message.role === 'user' && (
                            <User className="h-4 w-4 text-blue-100 mt-0.5 flex-shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
              {/* Loading indicator for assistant's reply */}
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="bg-gray-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-blue-600" />
                        <div className="flex items-center gap-1">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          <span className="text-sm text-gray-600">Thinking...</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {/* Dummy div to scroll to bottom */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error message display */}
        {error && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Input area for typing and sending messages */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a health-related question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="px-4"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • This is not a substitute for professional medical advice
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 