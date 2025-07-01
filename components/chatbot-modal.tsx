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
  // const handleFetchHistory = async () => {
  //   if (!user?.id) {
  //     toast.error('You must be signed in to view chat history.');
  //     return;
  //   }
  //   setIsLoading(true);
  //   try {
  //     const prevChats = await getChatHistory(user.id);
  //     setHistory(prevChats);
  //     setShowHistory(true);
  //   } catch (err) {
  //     toast.error('Failed to load previous chats.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 bg-white dark:bg-slate-900 border border-border dark:border-slate-700">
        {/* Header with Previous Chats button */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-border dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Health Assistant
                </DialogTitle>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  Ask me about health-related questions
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>



        {/* Main chat area (scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-slate-900">
          {/* If no messages, show welcome and quick questions */}
          {messages.length === 0 ? (
            <div className="text-center py-2">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full w-fit mx-auto mb-4">
                <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Welcome to Health Assistant
              </h3>
              <p className="text-gray-600 dark:text-slate-300 mb-6 max-w-sm mx-auto">
                I'm here to help with general health questions. Remember, I'm not a substitute for professional medical advice.
              </p>
              {/* Quick Questions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-slate-200 mb-3">
                  Try asking:
                </p>
                {getQuickQuestions().map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto p-3 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
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
                    <Card className={`${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-slate-800 dark:text-slate-200'} border-none`}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          {message.role === 'assistant' && (
                            <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="font-bold text-xs mb-1">
                              {message.role === 'user' ? 'YOU' : 'BOT'}
                            </div>
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100 dark:text-blue-200' : 'text-gray-500 dark:text-slate-400'}`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                          {message.role === 'user' && (
                            <User className="h-4 w-4 text-blue-100 dark:text-blue-200 mt-0.5 flex-shrink-0" />
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
                  <Card className="bg-gray-50 dark:bg-slate-800 dark:text-slate-200 border-none">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <div className="flex items-center gap-1">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                          <span className="text-sm text-gray-600 dark:text-slate-300">Thinking...</span>
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
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-400 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Input area for typing and sending messages */}
        <div className="p-4 border-t bg-white dark:bg-slate-900 border-border dark:border-slate-700">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a health-related question..."
              disabled={isLoading}
              className="flex-1 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-400"
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
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 text-center">
            Press Enter to send • This is not a substitute for professional medical advice
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 