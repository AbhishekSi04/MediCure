"use client"

import { useEffect, useState } from "react";
import { getUserChatRooms } from "@/actions/message";
import DoctorChatModal from "./doctor-chat-modal";
import { useUser } from "@clerk/nextjs";

export default function DoctorMessages() {
    const { user } = useUser(); // Get the logged-in doctor 
    const [chatRooms, setChatRooms] = useState<any[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Fetch all chat rooms for this doctor
    useEffect(() => {
        if (user?.id) {
            // Backend already converts Clerk user ID to UUID
            getUserChatRooms(user.id).then((rooms) => setChatRooms(rooms || []));
        }
    }, [user?.id]);

    const handleReply = (room: any) => {
        setSelectedRoom(room);
        setIsChatOpen(true);
    };

    return (
        <div className=" pb-4">
            <h1 className="text-xl font-bold mb-4 ">All Patient Messages</h1>
            {chatRooms.length === 0 ? (
                <div className="text-gray-500">No messages from patients yet.</div>
            ) : (
                <div className="space-y-4">
                    {chatRooms.map((room) => {
                        const patient = room.patient;
                        const lastMessage = room.messages?.[0];
                        return (
                            <div
                                key={room.id}
                                className="flex items-center justify-between border p-4 rounded"
                            >
                                <div className=" bg-muted/30">
                                    <div className="font-semibold">{patient?.name || "Unknown Patient"}</div>
                                    <div className="text-sm text-gray-600">
                                        {lastMessage
                                            ? `${lastMessage.sender?.name || "Unknown"}: ${lastMessage.content}`
                                            : "No messages yet."}
                                    </div>
                                </div>
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    onClick={() => handleReply(room)}
                                >
                                    Reply
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
            {/* Doctor chat modal for replying to a patient */}
            {selectedRoom && (
                <DoctorChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    doctor={user}
                    patient={selectedRoom.patient}
                    chatRoomId={selectedRoom.id}
                />
            )}
        </div>
    );
}