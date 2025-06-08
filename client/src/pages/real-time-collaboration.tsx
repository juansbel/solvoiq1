import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send,
  Users,
  MessageCircle,
  Video,
  Phone,
  Share2,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Search,
  Filter,
  MoreHorizontal,
  Circle,
  CheckCircle2,
  Clock,
  Star,
  Reply,
  Forward,
  Archive
} from "lucide-react";
import { CharacterAvatar } from "@/components/character-avatar";
import { useToast } from "@/hooks/use-toast";
import type { TeamMember } from "@/../../shared/schema";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: "text" | "file" | "image" | "system";
  edited?: boolean;
  reactions?: { emoji: string; users: string[] }[];
  threadId?: string;
}

interface Channel {
  id: string;
  name: string;
  type: "public" | "private" | "direct";
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  description?: string;
}

interface OnlineUser {
  id: string;
  name: string;
  status: "online" | "away" | "busy" | "offline";
  lastSeen?: Date;
}

const mockChannels: Channel[] = [
  {
    id: "general",
    name: "General",
    type: "public",
    participants: ["sarah", "mike", "david"],
    unreadCount: 3,
    description: "General team discussions"
  },
  {
    id: "projects",
    name: "Projects",
    type: "public", 
    participants: ["sarah", "mike", "david"],
    unreadCount: 1,
    description: "Project-related discussions"
  },
  {
    id: "sarah-mike",
    name: "Sarah Chen",
    type: "direct",
    participants: ["sarah", "mike"],
    unreadCount: 0
  }
];

const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "sarah",
    senderName: "Sarah Chen",
    content: "Good morning team! Let's review today's priorities.",
    timestamp: new Date("2024-01-22T09:00:00"),
    type: "text"
  },
  {
    id: "2", 
    senderId: "mike",
    senderName: "Mike Rodriguez",
    content: "I've completed the client portal redesign mockups. Ready for review.",
    timestamp: new Date("2024-01-22T09:15:00"),
    type: "text"
  },
  {
    id: "3",
    senderId: "david",
    senderName: "David Kim", 
    content: "Great work Mike! I'll review them after the standup meeting.",
    timestamp: new Date("2024-01-22T09:20:00"),
    type: "text",
    reactions: [{ emoji: "👍", users: ["sarah", "mike"] }]
  }
];

const mockOnlineUsers: OnlineUser[] = [
  { id: "sarah", name: "Sarah Chen", status: "online" },
  { id: "mike", name: "Mike Rodriguez", status: "away" },
  { id: "david", name: "David Kim", status: "online" }
];

export default function RealTimeCollaboration() {
  const [selectedChannel, setSelectedChannel] = useState<Channel>(mockChannels[0]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mockMessages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "current-user",
      senderName: "You",
      content: messageInput,
      timestamp: new Date(),
      type: "text"
    };

    // In real implementation, send via WebSocket
    mockMessages.push(newMessage);
    setMessageInput("");
    
    toast({
      title: "Message sent",
      description: "Your message has been delivered.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      case "busy": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "public": return "#";
      case "private": return "🔒";
      case "direct": return "";
      default: return "#";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Team Collaboration
          </h1>
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-1">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              CHANNELS
            </div>
            {mockChannels
              .filter(channel => channel.type !== "direct")
              .map((channel) => (
                <div
                  key={channel.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedChannel.id === channel.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                  onClick={() => setSelectedChannel(channel)}
                >
                  <span className="text-gray-400 font-medium">
                    {getChannelIcon(channel.type)}
                  </span>
                  <span className="flex-1 font-medium text-gray-900 dark:text-white">
                    {channel.name}
                  </span>
                  {channel.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {channel.unreadCount}
                    </Badge>
                  )}
                </div>
              ))}
          </div>

          <Separator className="my-2" />

          <div className="p-4 space-y-1">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              DIRECT MESSAGES
            </div>
            {mockChannels
              .filter(channel => channel.type === "direct")
              .map((channel) => (
                <div
                  key={channel.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedChannel.id === channel.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                  onClick={() => setSelectedChannel(channel)}
                >
                  <div className="relative">
                    <CharacterAvatar name={channel.name} size="sm" />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor("online")}`} />
                  </div>
                  <span className="flex-1 font-medium text-gray-900 dark:text-white">
                    {channel.name}
                  </span>
                  {channel.unreadCount > 0 && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              ))}
          </div>

          <Separator className="my-2" />

          {/* Online Users */}
          <div className="p-4 space-y-1">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              ONLINE ({mockOnlineUsers.filter(u => u.status === "online").length})
            </div>
            {mockOnlineUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <div className="relative">
                  <CharacterAvatar name={user.name} size="sm" />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(user.status)}`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedChannel.type === "direct" ? (
                <CharacterAvatar name={selectedChannel.name} size="md" />
              ) : (
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {getChannelIcon(selectedChannel.type)}
                  </span>
                </div>
              )}
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {selectedChannel.name}
                </h2>
                {selectedChannel.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedChannel.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {mockMessages.map((message) => (
              <div key={message.id} className="flex gap-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-lg">
                <CharacterAvatar name={message.senderName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {message.senderName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.edited && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>
                  <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                    {message.content}
                  </div>
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {message.reactions.map((reaction, index) => (
                        <button
                          key={index}
                          className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <span>{reaction.emoji}</span>
                          <span>{reaction.users.length}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-start gap-1">
                  <Button variant="ghost" size="sm">
                    <Reply className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <div className="relative">
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message ${selectedChannel.type === "direct" ? selectedChannel.name : "#" + selectedChannel.name}`}
                  className="min-h-[44px] max-h-32 resize-none pr-12"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span>{messageInput.length}/2000</span>
              </div>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="mb-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Thread/Details */}
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="details" className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Channel Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <span className="capitalize">{selectedChannel.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Members:</span>
                  <span>{selectedChannel.participants.length}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Members ({selectedChannel.participants.length})
              </h3>
              <div className="space-y-2">
                {selectedChannel.participants.map((participant) => {
                  const user = mockOnlineUsers.find(u => u.id === participant);
                  return (
                    <div key={participant} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="relative">
                        <CharacterAvatar name={user?.name || participant} size="sm" />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(user?.status || "offline")}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{user?.name || participant}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {user?.status || "offline"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="p-4">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">No files shared yet</h3>
              <p className="text-sm">Files shared in this conversation will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}