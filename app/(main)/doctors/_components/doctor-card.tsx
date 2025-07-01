"use client"

import { useState } from "react";
import { User, Star, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Doctor } from "@/lib/doctor";
import ChatModal from "./chat-modal";
import { getOrCreateChatRoomByClerkIds } from "@/actions/message";
import { useUser } from "@clerk/nextjs";
// import { checkUser } from "@/lib/checkUser";

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  // State for controlling the chat modal
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  // Handle Message button click
  const handleMessageClick = async () => {
    if (!user?.id) {
      alert("Please sign in to send messages");
      return;
    }

    if (!doctor?.clerkUserId) {
      alert("Invalid doctor information");
      return;
    }

    setLoading(true);
    try {
      const chatRoom = await getOrCreateChatRoomByClerkIds(doctor.clerkUserId, user.id);
      if (!chatRoom) {
        throw new Error("Failed to create or find chat room");
      }
      setChatRoomId(chatRoom.id);
      setIsChatOpen(true);
    } catch (err: any) {
      console.error("Chat error:", err);
      alert(err?.message || "Failed to start chat. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-blue-900/20 dark:border-blue-400/30 hover:border-blue-700/40 dark:hover:border-blue-300/40 bg-white dark:bg-zinc-900 transition-all">
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-900/20 dark:bg-blue-400/20 flex items-center justify-center flex-shrink-0">
            {doctor.imageUrl ? (
              <img
                src={doctor.imageUrl}
                alt={doctor.name || "Doctor Image"}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-blue-400 dark:text-blue-300" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-lg">{doctor.name}</h3>
              <Badge
                variant="outline"
                className="bg-blue-900/20 dark:bg-blue-400/20 border-blue-900/30 dark:border-blue-400/30 text-blue-400 dark:text-blue-300 self-start"
              >
                <Star className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-1">
              {doctor.specialty} • {doctor.experience} years experience
            </p>

            <div className="mt-4 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              {doctor.description}
            </div>

              <Button
                asChild
                className="w-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white dark:text-zinc-100 mt-2"
              >
                <Link href={`/doctors/${doctor.specialty}/${doctor.id}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  View Profile & Book
                </Link>
              </Button>
              {/* Message button to open chat modal */}
              <Button
                variant="outline"
                className="w-full mt-2 border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={handleMessageClick}
                type="button"
                disabled={loading}
              >
                {loading ? "Loading..." : "Message"}
              </Button>
            {/* Chat modal for messaging this doctor, only open when chatRoomId is available */}
            {chatRoomId && (
              <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                doctor={doctor}
                patient={user}
                chatRoomId={chatRoomId}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}