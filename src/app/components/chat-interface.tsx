import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send, ArrowLeft } from "lucide-react";

export interface ChatMessage {
  id: string;
  submissionId: string;
  senderId: string;
  senderName: string;
  senderType: "doctor" | "patient";
  message: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  submissionId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserType: "doctor" | "patient";
  otherUserName: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onBack?: () => void;
}

export function ChatInterface({
  submissionId,
  currentUserId,
  currentUserName,
  currentUserType,
  otherUserName,
  messages,
  onSendMessage,
  onBack,
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const filteredMessages = messages.filter(
    (msg) => msg.submissionId === submissionId
  );

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <CardTitle className="text-green-800">
              Chat with {otherUserName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentUserType === "doctor" ? "Patient Consultation" : "Medical Consultation"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] flex flex-col">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isCurrentUser = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      isCurrentUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback
                        className={
                          msg.senderType === "doctor"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }
                      >
                        {msg.senderName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex flex-col ${
                        isCurrentUser ? "items-end" : "items-start"
                      } max-w-[70%]`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isCurrentUser
                            ? "bg-green-700 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">
                          {msg.senderName}
                        </p>
                        <p>{msg.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form
            onSubmit={handleSend}
            className="border-t p-4 flex gap-2"
          >
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              className="bg-green-700 hover:bg-green-600"
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
