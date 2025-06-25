"use server"

import { db } from '@/lib/prisma';
import { $Enums } from '@/lib/generated/prisma';

/**
 * Get or create a chat room between a doctor and a patient.
 * Ensures only one chat room exists per doctor-patient pair.
 * @param doctorId - The doctor's user ID
 * @param patientId - The patient's user ID
 * @returns The chat room object or null if error occurs
 */
export async function getOrCreateChatRoom(doctorId: string, patientId: string) {
    try {
        // console.log('Starting getOrCreateChatRoom with:', { doctorId, patientId });

        // Input validation
        if (!doctorId || typeof doctorId !== 'string') {
            throw new Error('Invalid doctorId provided');
        }
        if (!patientId || typeof patientId !== 'string') {
            throw new Error('Invalid patientId provided');
        }
        if (doctorId === patientId) {
            throw new Error('Doctor and patient cannot be the same user');
        }

        // console.log('Validation passed, checking doctor exists...');

        // Verify doctor exists in the users table
        const doctorExists = await db.user.findUnique({
            where: { id: doctorId },
            select: { role: true }
        });

        // console.log('Doctor check result:', doctorExists);

        if (!doctorExists || doctorExists.role !== 'DOCTOR') {
            throw new Error('Doctor not found or invalid role');
        }

        // console.log('Doctor verified, searching for existing chat room...');

        // Try to find existing chat room
        let chatRoom = await db.chatRoom.findUnique({
            where: {
                doctorId_patientId: {
                    doctorId: doctorId,
                    patientId: patientId
                }
            }
        });

        // console.log('Existing chat room search result:', chatRoom);

        // If not found, create a new one
        if (!chatRoom) {
            // console.log('No existing chat room found, creating new one...');
            chatRoom = await db.chatRoom.create({
                data: { doctorId, patientId }
            });
            // console.log('New chat room created:', chatRoom);
        }

        return chatRoom;
    } catch (error: any) {
        console.error('Chat room error location:', new Error().stack);
        console.error('Chat room error details:', {
            message: error.message,
            code: error.code,
            meta: error.meta
        });
        return null;
    }
}

/**
 * Send a message in a chat room.
 * Supports TEXT, IMAGE, and FILE message types.
 * @param chatRoomId - The chat room ID
 * @param senderId - The user ID of the sender
 * @param messageType - The type of message ('TEXT', 'IMAGE', 'FILE')
 * @param content - The message content (text or URL)
 * @returns The created message object
 */
export async function sendMessage({
  chatRoomId,
  senderId,
  messageType,
  content
}: {
  chatRoomId: string;
  senderId: string;
  messageType: $Enums.MessageType; // 'TEXT' | 'IMAGE' | 'FILE'
  content: string;
}) {
  
  // Validate input
  if (!chatRoomId || !senderId || !messageType || !content) {
    throw new Error('All fields are required.');
  }
  // console.log('create karne se pahile aa gye');
  if (!['TEXT', 'IMAGE', 'FILE'].includes(messageType)) {
    throw new Error('Invalid message type.');
  }
  // console.log('create karne se pahile aa gye');
  const user = await db.user.findUnique({
    where:{
      clerkUserId:senderId
    }
  })
  // converting the clerkId to uuuid
  if(user===null) return
  senderId= user.id;
  // console.log(senderId);
  // Check that chat room exists
  const chatRoom = await db.chatRoom.findUnique({ where: { id: chatRoomId } });
  if (!chatRoom) {
    throw new Error('Chat room not found.');
  }
  // console.log('create karne se pahile aa gye');
  // Check that sender is part of the chat room
  if (user.id !== chatRoom.doctorId && senderId !== chatRoom.patientId) {
    throw new Error('Sender is not a participant in this chat room.');
  }
  // console.log('create karne se pahile aa gye');
  // For TEXT, ensure content is not empty
  if (messageType === 'TEXT' && !content.trim()) {
    throw new Error('Text message cannot be empty.');
  }
  // console.log('create karne se pahile aa gye');
  // For IMAGE/FILE, you may want to validate URL format (basic check)
  if ((messageType === 'IMAGE' || messageType === 'FILE') && !/^https?:\/\//.test(content)) {
    throw new Error('Content must be a valid URL for image or file messages.');
  }

  // console.log('create karne se pahile aa gye');
  // Create the message
  return db.message.create({
    data: {
      chatRoomId,
      senderId,
      messageType,
      content
    }
  });

}

/**
 * Fetch chat history for a given chat room.
 * Returns messages in chronological order, including sender info.
 * @param chatRoomId - The chat room ID
 * @returns Array of messages with sender info
 */
export async function getChatHistory(chatRoomId: string) {
  if (!chatRoomId) {
    throw new Error('chatRoomId is required.');
  }
  // Fetch messages, oldest first
  return db.message.findMany({
    where: { chatRoomId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: {
        select: { id: true, name: true }
      }
    }
  });
}

/**
 * Fetch all chat rooms for a user (as doctor or patient), with last message preview.
 * @param userId - The user's ID
 * @returns Array of chat rooms with last message and participant info
 */
export async function getUserChatRooms(userId: string) {
  if (!userId) {
    throw new Error('userId is required.');
  }
  // convert userId from clerkid to id 
  const user = await db.user.findUnique({
    where:{
      clerkUserId:userId,
    }
  });
  if(user==null) return ;
  
  userId  = user.id;
  return db.chatRoom.findMany({
    where: {
      OR: [
        { doctorId: userId },
        { patientId: userId }
      ]
    },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1 // Last message only
      },
      doctor: {
        select: { id: true, name: true }
      },
      patient: {
        select: { id: true, name: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

/**
 * Server action: Get or create a chat room using Clerk user IDs for both doctor and patient.
 * Looks up both users in the User table and uses their UUIDs for chat room creation.
 */
export async function getOrCreateChatRoomByClerkIds(doctorClerkUserId: string, patientClerkUserId: string) {
    try {
        const doctorUser = await db.user.findUnique({ where: { clerkUserId: doctorClerkUserId } });
        const patientUser = await db.user.findUnique({ where: { clerkUserId: patientClerkUserId } });
        if (!doctorUser || !patientUser) {
            throw new Error("Doctor or patient not found in the User table");
        }
        return await getOrCreateChatRoom(doctorUser.id, patientUser.id);
    } catch (error: any) {
        console.error('getOrCreateChatRoomByClerkIds error:', error.message);
        return null;
    }
}


export async function convertClerkIdToUuuid(Id: string){
  try {
    if(Id==null) return undefined;
    const user = await db.user.findUnique({
      where:{
        clerkUserId:Id,
      }
    });

    return user?.id;

  } catch (error:any) {
    console.error(error.message);
  }
}