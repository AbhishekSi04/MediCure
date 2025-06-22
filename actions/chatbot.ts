'use server'

import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";


export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

const SYSTEM_PROMPT = `You are a helpful healthcare assistant. You can provide general health information, answer medical questions, and offer guidance on common health concerns.\n\nIMPORTANT: You are not a substitute for professional medical advice. Always recommend consulting with a healthcare provider for serious symptoms. You cannot diagnose medical conditions. For emergencies, always call emergency services.`;

// Save a chat message (user or assistant) to the database
async function saveChatMessageToDb(userId: string, role: 'user' | 'assistant', content: string) {
  await db.chatMessage.create({
    data: {
      userId,
      role,
      content,
      // timestamp is set automatically
    }
  });
}

// Get all chat messages for a user, ordered by time
export async function getChatHistory(userId: string): Promise<ChatMessage[]> {
  // Find the user by their Clerk ID and include their chat messages
  const userWithChats = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      // Order the messages by timestamp
      chatMessages: {
        orderBy: {
          timestamp: 'asc',
        },
      },
    },
  });

  // If no user or no chats are found, return an empty array
  if (!userWithChats || !userWithChats.chatMessages) {
    return [];
  }

  // Map the database messages to the ChatMessage type for the frontend
  return userWithChats.chatMessages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    timestamp: msg.timestamp
  }));
}

export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    // 1. Authenticate user
    const user = await checkUser();
    if ('error' in user) {
      return { message: '', error: 'Authentication required' };
    }
    const userId = user.id;

    // 2. Validate input
    if (!message.trim()) {
      return { message: '', error: 'Message cannot be empty' };
    }

    // 3. Save the user's message to the database
    await saveChatMessageToDb(userId, 'user', message);

    // 4. Prepare conversation for Groq API
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    // 5. Call the Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-r1-distill-llama-70b",
        messages,
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Groq API Error:", errorBody);
      throw new Error(`Groq API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content?.trim();

    if (!assistantMessage) {
      return { message: '', error: 'No response from the health assistant.' };
    }

    // 6. Save the assistant's reply to the database
    await saveChatMessageToDb(userId, 'assistant', assistantMessage);

    // 7. Return the assistant's reply
    return { message: assistantMessage };

  } catch (error) {
    console.error('Chatbot error:', error);
    return {
      message: '',
      error: 'Sorry, I encountered an error while processing your request. Please try again later.'
    };
  }
}
