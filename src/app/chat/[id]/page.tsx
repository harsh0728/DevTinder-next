// "use client";

// import { apiFetch } from "@/lib/api";
// import { socketconnection } from "@/lib/socket";
// import { useAppSelector } from "@/store/hooks";
// import { ApiResponse } from "@/types/api-types";
// import { chatType } from "@/types/chat";
// import { User } from "@/types/user";
// import { useParams, useRouter } from "next/navigation";
// import React, { FormEvent, useEffect, useRef, useState } from "react";

// type Message = {
//   _id?: string;
//   userId?: string;
//   firstName?: string;
//   message: string;
//   timestamp: string;
//   edited: boolean;
// };

// export default function ChatPage() {
//   const user = useAppSelector((state) => state.user.user);
//   const userId = user?._id;
//   const router = useRouter();

//   const { id: targetUserId } = useParams<{ id: string }>();
//   const socket = socketconnection;

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [targetUser, setTargetUser] = useState<User | null>(null);
//   const [isTyping, setIsTyping] = useState(false);
//   const [showEmoji, setShowEmoji] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [showMessageMenu, setShowMessageMenu] = useState<number | null>(null);
//   const [onlineStatus, setOnlineStatus] = useState<{
//     isOnline: boolean;
//     lastSeen: string | null;
//   }>({ isOnline: false, lastSeen: null });

//   const messagesEndRef = useRef<HTMLDivElement | null>(null);
//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const emojis = [
//     "😀","😃","😄","😁","😅","😂","🤣","😊","😇","🙂",
//     "😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛",
//     "😝","😜","🤪","🤨","🧐","🤓","😎","🥳","😏","😒",
//     "😞","😔","😟","😕","🙁","😣","😖","😫","😩","🥺",
//     "😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶",
//     "😱","😨","😰","😥","😓","🤗","🤔","🤭","🤫","🤥",
//     "😶","😐","😑","😬","🙄","😯","😦","😧","😮","😲",
//     "🥱","😴","🤤","😪","😵","🤐","🥴","🤢","🤮","🤧",
//     "😷","🤒","🤕","🤑","🤠","👍","👎","👏","🙌","👋",
//     "🤝","🙏","✌️","🤞","🤟","🤘","🤙","💪","🦾","❤️",
//     "🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️",
//     "💕","💞","💓","💗","💖","💘","💝","🔥","✨","⭐",
//   ];

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     if (!userId || !targetUserId) return;

//     getPreviousChats();
//     getTargetUserInfo();

//     // connect socket and join room
//     socket.connect();
//     socket.emit("join-room", { firstName: user?.firstName, userId, targetUserId });
//     socket.emit("user-online", { userId });

//     socket.on("receive-message", (data) => {
//       setMessages((prev) => [...prev, { ...data, timestamp: new Date().toISOString() }]);
//     });

//     socket.on("user-typing", ({ userId: typingUserId }: { userId: string }) => {
//       if (typingUserId === targetUserId) setIsTyping(true);
//     });

//     socket.on("user-stop-typing", ({ userId: typingUserId }: { userId: string }) => {
//       if (typingUserId === targetUserId) setIsTyping(false);
//     });

//     socket.on("user-online", ({ userId: onlineUserId }: { userId: string }) => {
//       if (onlineUserId === targetUserId)
//         setOnlineStatus({ isOnline: true, lastSeen: null });
//     });

//     socket.on("user-offline", ({ userId: offlineUserId, lastSeen }: { userId: string; lastSeen: string }) => {
//       if (offlineUserId === targetUserId)
//         setOnlineStatus({ isOnline: false, lastSeen });
//     });

//     socket.on("message-deleted", ({ messageId }: { messageId: string }) => {
//       setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
//     });

//     socket.on("message-edited", ({ messageId, newText }: { messageId: string; newText: string }) => {
//       setMessages((prev) =>
//         prev.map((msg) =>
//           msg._id === messageId ? { ...msg, message: newText, edited: true } : msg
//         )
//       );
//     });

//     return () => {
//       socket.off("receive-message");
//       socket.off("user-typing");
//       socket.off("user-stop-typing");
//       socket.off("user-online");
//       socket.off("user-offline");
//       socket.off("message-deleted");
//       socket.off("message-edited");
//     };
//   }, [userId, targetUserId]);

//   const getTargetUserInfo = async () => {
//     try {
//       const response = await apiFetch<ApiResponse<User>>(`/user/${targetUserId}`);
//       if (response.data) setTargetUser(response.data);
//     } catch (error) {
//       console.error("Failed to load user info", error);
//     }
//   };

//   const getPreviousChats = async () => {
//     try {
//       const chats = await apiFetch<chatType[]>(`/chat/${targetUserId}`);
//       const formattedChat = chats.map((chat) => ({
//         _id: chat._id,
//         userId: chat.senderId._id,
//         firstName: chat.senderId.firstName,
//         message: chat.text,
//         timestamp: chat.createdAt,
//         edited: chat.createdAt !== chat.updatedAt,
//       }));
//       setMessages(formattedChat);
//     } catch (error) {
//       console.error("Failed to load previous chats", error);
//     }
//   };

//   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const message = inputMessage.trim();
//     if (!message) return;

//     const newMessage: Message = {
//       userId,
//       firstName: user?.firstName,
//       message,
//       timestamp: new Date().toISOString(),
//       edited: false,      // ✅ required field
//       _id: undefined,     // ✅ optimistic — no _id yet from server
//     };

//     socket.emit("send-message", {
//       firstName: user?.firstName,
//       userId,
//       targetUserId,
//       message,
//     });

//     setMessages((prev) => [...prev, newMessage]);
//     setInputMessage("");
//     socket.emit("stop-typing", { userId, targetUserId });
//   };

//   // ✅ correct event type for input onChange
//   const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setInputMessage(e.target.value);

//     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

//     if (e.target.value.length > 0) {
//       socket.emit("typing", { userId, targetUserId });
//       typingTimeoutRef.current = setTimeout(() => {
//         socket.emit("stop-typing", { userId, targetUserId });
//       }, 2000);
//     } else {
//       socket.emit("stop-typing", { userId, targetUserId });
//     }
//   };

//   const handleEmojiClick = (emoji: string) => {
//     setInputMessage((prev) => prev + emoji);
//     setShowEmoji(false);
//     inputRef.current?.focus();
//   };

//   const handleDeleteMessage = async (messageId: string) => {
//     try {
//       await apiFetch(`/chat/${messageId}`, { method: "DELETE" });
//       socket.emit("delete-message", { messageId, targetUserId });
//       setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
//       setShowMessageMenu(null);
//     } catch (error) {
//       console.error("Failed to delete message", error);
//     }
//   };

//   const handleEditMessage = async (messageId: string, currentText: string) => {
//     const newText = prompt("Edit message:", currentText);
//     if (newText && newText.trim() !== currentText) {
//       try {
//         await apiFetch(`/chat/${messageId}`, {
//           method: "PATCH",
//           body: JSON.stringify({ text: newText.trim() }),
//         });
//         socket.emit("edit-message", { messageId, newText: newText.trim(), targetUserId });
//         setMessages((prev) =>
//           prev.map((msg) =>
//             msg._id === messageId ? { ...msg, message: newText.trim(), edited: true } : msg
//           )
//         );
//         setShowMessageMenu(null);
//       } catch (error) {
//         console.error("Failed to edit message", error);
//       }
//     }
//   };

//   const handleAudioCall = () => {
//     router.push(`/call/${userId}/${targetUserId}?type=audio&role=caller`);
//   };

//   const handleVideoCall = () => {
//     router.push(`/call/${userId}/${targetUserId}?type=video&role=caller`);
//   };

//   const formatTime = (timestamp: string) => {
//     if (!timestamp) return "";
//     return new Date(timestamp).toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const formatLastSeen = (lastSeen: string) => {
//     if (!lastSeen) return "";
//     const date = new Date(lastSeen);
//     const diffMs = new Date().getTime() - date.getTime();
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);

//     if (diffMins < 1) return "just now";
//     if (diffMins < 60) return `${diffMins}m ago`;
//     if (diffHours < 24) return `${diffHours}h ago`;
//     if (diffDays < 7) return `${diffDays}d ago`;
//     return date.toLocaleDateString();
//   };

//   return (
//     <div className="h-full w-full relative bg-gradient-to-b from-gray-900 via-gray-900 to-black flex flex-col">

//       {/* Header */}
//       <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4 shadow-lg flex-shrink-0">
//         <button
//           onClick={() => router.back()}
//           className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg lg:hidden"
//         >
//           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//           </svg>
//         </button>

//         <div className="relative">
//           <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg ring-2 ring-purple-500/20">
//             {targetUser?.firstName?.[0]?.toUpperCase() || "?"}
//           </div>
//           {onlineStatus.isOnline && (
//             <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-gray-800" />
//           )}
//         </div>

//         <div className="flex-1 min-w-0">
//           <h2 className="text-white font-semibold text-base sm:text-lg truncate">
//             {targetUser?.firstName || "Loading..."}
//           </h2>
//           <p className="text-xs sm:text-sm">
//             {isTyping ? (
//               <span className="text-green-400 flex items-center gap-1">
//                 <span>typing</span>
//                 <span className="flex gap-0.5">
//                   <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" />
//                   <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce [animation-delay:0.2s]" />
//                   <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce [animation-delay:0.4s]" />
//                 </span>
//               </span>
//             ) : onlineStatus.isOnline ? (
//               <span className="text-green-400">online</span>
//             ) : (
//               <span className="text-gray-400">
//                 {onlineStatus.lastSeen ? `last seen ${formatLastSeen(onlineStatus.lastSeen)}` : "offline"}
//               </span>
//             )}
//           </p>
//         </div>

//         {/* Audio Call */}
//         <button onClick={handleAudioCall} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg" title="Audio Call">
//           <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//           </svg>
//         </button>

//         {/* Video Call */}
//         <button onClick={handleVideoCall} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg" title="Video Call">
//           <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//           </svg>
//         </button>

//         {/* Menu */}
//         <div className="relative">
//           <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg">
//             <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
//             </svg>
//           </button>
//           {showMenu && (
//             <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
//               {[
//                 { label: "View Profile", action: () => alert("View Profile") },
//                 { label: "Search", action: () => alert("Search in Chat") },
//                 { label: "Clear Chat", action: () => { if (confirm("Clear all messages?")) setMessages([]); } },
//               ].map(({ label, action }) => (
//                 <button key={label} onClick={() => { action(); setShowMenu(false); }} className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors">
//                   {label}
//                 </button>
//               ))}
//               <button onClick={() => { alert("Block User"); setShowMenu(false); }} className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700 transition-colors">
//                 Block
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 sm:space-y-4 scroll-smooth">
//         {messages.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full text-gray-500">
//             <svg className="w-16 h-16 sm:w-20 sm:h-20 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//             </svg>
//             <p className="text-sm sm:text-base">No messages yet</p>
//             <p className="text-xs sm:text-sm mt-1">Start the conversation!</p>
//           </div>
//         ) : (
//           messages.map((msg, index) => {
//             const isMe = msg.userId === userId;
//             const showAvatar = index === 0 || messages[index - 1]?.userId !== msg.userId;

//             return (
//               <div
//                 key={index}
//                 className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}
//               >
//                 {/* Other user avatar */}
//                 {!isMe && (
//                   <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
//                     {showAvatar ? msg.firstName?.[0]?.toUpperCase() : ""}
//                   </div>
//                 )}

//                 {/* Bubble */}
//                 <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%] sm:max-w-[70%] group`}>
//                   <div className="relative">
//                     <div className={`px-3 sm:px-4 py-2 rounded-2xl shadow-lg ${isMe ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md" : "bg-gray-800 text-white rounded-bl-md border border-gray-700/50"}`}>
//                       <p className="text-xs sm:text-sm leading-relaxed break-words">
//                         {msg.message}
//                         {msg.edited && <span className="text-[10px] opacity-60 ml-2">(edited)</span>}
//                       </p>
//                     </div>

//                     {/* Edit/Delete — own messages only */}
//                     {isMe && msg._id && (
//                       <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <button
//                           onClick={() => setShowMessageMenu(showMessageMenu === index ? null : index)}
//                           className="p-1 bg-gray-700 rounded-full hover:bg-gray-600"
//                         >
//                           <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
//                             <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
//                           </svg>
//                         </button>
//                         {showMessageMenu === index && (
//                           <div className="absolute right-0 mt-1 w-32 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
//                             <button onClick={() => handleEditMessage(msg._id!, msg.message)} className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center gap-2">
//                               Edit
//                             </button>
//                             <button onClick={() => handleDeleteMessage(msg._id!)} className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2">
//                               Delete
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                   <span className="text-[10px] sm:text-xs text-gray-500 mt-1 px-2">
//                     {formatTime(msg.timestamp)}
//                   </span>
//                 </div>

//                 {/* My avatar */}
//                 {isMe && (
//                   <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
//                     {showAvatar ? user?.firstName?.[0]?.toUpperCase() : ""}
//                   </div>
//                 )}
//               </div>
//             );
//           })
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Emoji Picker */}
//       {showEmoji && (
//         <div className="bg-gray-800 border-t border-gray-700 p-3 max-h-60 overflow-y-auto">
//           <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
//             {emojis.map((emoji, index) => (
//               <button key={index} onClick={() => handleEmojiClick(emoji)} className="text-2xl hover:bg-gray-700 rounded p-1 transition-colors">
//                 {emoji}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Input */}
//       <div className="bg-gray-800/50 backdrop-blur-lg border-t border-gray-700/50 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
//         <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
//           <button type="button" onClick={() => setShowEmoji(!showEmoji)} className={`flex-shrink-0 p-2 hover:bg-gray-700/50 rounded-lg transition-all ${showEmoji ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"}`}>
//             <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
//               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
//             </svg>
//           </button>

//           <input
//             ref={inputRef}
//             type="text"
//             value={inputMessage}
//             onChange={handleTyping}
//             className="flex-1 bg-gray-700/50 text-white placeholder-gray-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base border border-gray-700/30"
//             placeholder="Type a message..."
//           />

//           <button
//             type="submit"
//             disabled={!inputMessage.trim()}
//             className={`p-2.5 sm:p-3 rounded-full transition-all duration-200 flex-shrink-0 ${inputMessage.trim() ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transform hover:scale-105 active:scale-95" : "bg-gray-700/50 text-gray-500 cursor-not-allowed"}`}
//           >
//             <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//             </svg>
//           </button>
//         </form>
//       </div>

//       {/* Click outside to close */}
//       {(showMenu || showEmoji || showMessageMenu !== null) && (
//         <div className="fixed inset-0 z-40" onClick={() => { setShowMenu(false); setShowEmoji(false); setShowMessageMenu(null); }} />
//       )}
//     </div>
//   );
// }

"use client";

import { apiFetch } from "@/lib/api";
import { socketconnection } from "@/lib/socket";
import { useAppSelector } from "@/store/hooks";
import { ApiResponse } from "@/types/api-types";
import { chatType } from "@/types/chat";
import { User } from "@/types/user";
import { useParams, useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useRef, useState, useCallback } from "react";
import EditMessageModal from "@/components/EditMessageModal";

type Message = {
  _id?: string;
  userId?: string;
  firstName?: string;
  message: string;
  timestamp: string;
  edited: boolean;
};

export default function ChatPage() {
  const user = useAppSelector((state) => state.user.user);
  const userId = user?._id;
  const router = useRouter();

  const { id: targetUserId } = useParams<{ id: string }>();
  const socket = socketconnection;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<{
    isOnline: boolean;
    lastSeen: string | null;
  }>({ isOnline: false, lastSeen: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emojis = [
    "😀","😃","😄","😁","😅","😂","🤣","😊","😇","🙂",
    "😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛",
    "😝","😜","🤪","🤨","🧐","🤓","😎","🥳","😏","😒",
    "😞","😔","😟","😕","🙁","😣","😖","😫","😩","🥺",
    "😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶",
    "😱","😨","😰","😥","😓","🤗","🤔","🤭","🤫","🤥",
    "😶","😐","😑","😬","🙄","😯","😦","😧","😮","😲",
    "🥱","😴","🤤","😪","😵","🤐","🥴","🤢","🤮","🤧",
    "😷","🤒","🤕","🤑","🤠","👍","👎","👏","🙌","👋",
    "🤝","🙏","✌️","🤞","🤟","🤘","🤙","💪","🦾","❤️",
    "🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️",
    "💕","💞","💓","💗","💖","💘","💝","🔥","✨","⭐",
  ];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize socket connection and fetch data
  useEffect(() => {
    if (!userId || !targetUserId) {
      setError("Missing user information");
      return;
    }

    let isMounted = true;

    const initializeChat = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user info and previous chats in parallel
        const [userResponse, chatsResponse] = await Promise.all([
          apiFetch<ApiResponse<User>>(`/user/${targetUserId}`),
          apiFetch<chatType[]>(`/chat/${targetUserId}`),
        ]);

        if (!isMounted) return;

        // Set target user
        if (userResponse.data) {
          setTargetUser(userResponse.data);
        }

        // Format and set previous chats
        if (Array.isArray(chatsResponse)) {
          const formattedChat = chatsResponse.map((chat) => ({
            _id: chat._id,
            userId: chat.senderId._id,
            firstName: chat.senderId.firstName,
            message: chat.text,
            timestamp: chat.createdAt,
            edited: chat.createdAt !== chat.updatedAt,
          }));
          setMessages(formattedChat);
        }

        // Initialize socket connection (only if not already connected)
        if (!socket.connected) {
          socket.connect();
        }

        // Join chat room
        socket.emit("join-room", {
          firstName: user?.firstName,
          userId,
          targetUserId,
        });

        // Emit online status
        socket.emit("user-online", { userId });

        // Socket event listeners
        const handleReceiveMessage = (data: Message) => {
          if (!isMounted) return;
          setMessages((prev) => [...prev, {
            ...data,
            // Use server timestamp if available, otherwise current time
            timestamp: data.timestamp || new Date().toISOString(),
          }]);
        };

        const handleUserTyping = ({ userId: typingUserId }: { userId: string }) => {
          if (isMounted && typingUserId === targetUserId) {
            setIsTyping(true);
          }
        };

        const handleUserStopTyping = ({ userId: typingUserId }: { userId: string }) => {
          if (isMounted && typingUserId === targetUserId) {
            setIsTyping(false);
          }
        };

        const handleUserOnline = ({ userId: onlineUserId }: { userId: string }) => {
          if (isMounted && onlineUserId === targetUserId) {
            setOnlineStatus({ isOnline: true, lastSeen: null });
          }
        };

        const handleUserOffline = ({ userId: offlineUserId, lastSeen }: { userId: string; lastSeen: string }) => {
          if (isMounted && offlineUserId === targetUserId) {
            setOnlineStatus({ isOnline: false, lastSeen });
          }
        };

        const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
          if (!isMounted) return;
          setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        };

        const handleMessageEdited = ({ messageId, newText }: { messageId: string; newText: string }) => {
          if (!isMounted) return;
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === messageId ? { ...msg, message: newText, edited: true } : msg
            )
          );
        };

        // Register all socket listeners
        socket.on("receive-message", handleReceiveMessage);
        socket.on("user-typing", handleUserTyping);
        socket.on("user-stop-typing", handleUserStopTyping);
        socket.on("user-online", handleUserOnline);
        socket.on("user-offline", handleUserOffline);
        socket.on("message-deleted", handleMessageDeleted);
        socket.on("message-edited", handleMessageEdited);

        setLoading(false);

        // Cleanup function
        return () => {
          socket.off("receive-message", handleReceiveMessage);
          socket.off("user-typing", handleUserTyping);
          socket.off("user-stop-typing", handleUserStopTyping);
          socket.off("user-online", handleUserOnline);
          socket.off("user-offline", handleUserOffline);
          socket.off("message-deleted", handleMessageDeleted);
          socket.off("message-edited", handleMessageEdited);
        };
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load chat";
          setError(errorMessage);
          setLoading(false);
        }
      }
    };

    const cleanup = initializeChat();

    return () => {
      isMounted = false;
      cleanup?.then((fn) => fn?.());
    };
  }, [userId, targetUserId, user?.firstName, socket]);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = inputMessage.trim();
    if (!message) return;

    const newMessage: Message = {
      userId,
      firstName: user?.firstName,
      message,
      timestamp: new Date().toISOString(),
      edited: false,
      _id: undefined, // Will get from server
    };

    socket.emit("send-message", {
      firstName: user?.firstName,
      userId,
      targetUserId,
      message,
    });

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    socket.emit("stop-typing", { userId, targetUserId });
  }, [inputMessage, userId, user?.firstName, targetUserId, socket]);

  const handleTyping = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (e.target.value.length > 0) {
      socket.emit("typing", { userId, targetUserId });
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop-typing", { userId, targetUserId });
      }, 2000);
    } else {
      socket.emit("stop-typing", { userId, targetUserId });
    }
  }, [userId, targetUserId, socket]);

  const handleEmojiClick = useCallback((emoji: string) => {
    setInputMessage((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  }, []);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await apiFetch(`/chat/${messageId}`, { method: "DELETE" });
      socket.emit("delete-message", { messageId, targetUserId });
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete message";
      setError(errorMessage);
    }
  }, [targetUserId, socket]);

  const handleEditMessage = useCallback(async (messageId: string, newText: string) => {
    if (!newText.trim()) return;

    try {
      await apiFetch(`/chat/${messageId}`, {
        method: "PATCH",
        body: JSON.stringify({ text: newText.trim() }),
      });
      socket.emit("edit-message", { messageId, newText: newText.trim(), targetUserId });
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, message: newText.trim(), edited: true } : msg
        )
      );
      setEditingMessageId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to edit message";
      setError(errorMessage);
    }
  }, [targetUserId, socket]);

  const handleAudioCall = useCallback(() => {
    router.push(`/call/${userId}/${targetUserId}?type=audio&role=caller`);
  }, [userId, targetUserId, router]);

  const handleVideoCall = useCallback(() => {
    router.push(`/call/${userId}/${targetUserId}?type=video&role=caller`);
  }, [userId, targetUserId, router]);

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatLastSeen = (lastSeen: string) => {
    if (!lastSeen) return "";
    const date = new Date(lastSeen);
    const diffMs = new Date().getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M12 3a9 9 0 100 18 9 9 0 000-18z" />
          </svg>
          <p className="text-red-400 font-semibold">Error</p>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-gradient-to-b from-gray-900 via-gray-900 to-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4 shadow-lg flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="relative">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg ring-2 ring-purple-500/20">
            {targetUser?.firstName?.[0]?.toUpperCase() || "?"}
          </div>
          {onlineStatus.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-gray-800" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold text-base sm:text-lg truncate">
            {targetUser?.firstName || "Loading..."}
          </h2>
          <p className="text-xs sm:text-sm">
            {isTyping ? (
              <span className="text-green-400 flex items-center gap-1">
                <span>typing</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </span>
              </span>
            ) : onlineStatus.isOnline ? (
              <span className="text-green-400">online</span>
            ) : (
              <span className="text-gray-400">
                {onlineStatus.lastSeen ? `last seen ${formatLastSeen(onlineStatus.lastSeen)}` : "offline"}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={handleAudioCall}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
          title="Audio Call"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>

        <button
          onClick={handleVideoCall}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
          title="Video Call"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
              {[
                { label: "View Profile", action: () => {} },
                { label: "Search", action: () => {} },
                { label: "Clear Chat", action: () => {
                  if (confirm("Clear all messages?")) {
                    setMessages([]);
                  }
                }},
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={() => {
                    action();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => {
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700 transition-colors"
              >
                Block
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 sm:space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm sm:text-base">No messages yet</p>
            <p className="text-xs sm:text-sm mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.userId === userId;
            const showAvatar = index === 0 || messages[index - 1]?.userId !== msg.userId;

            return (
              <div key={msg._id || index} className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                {/* Other user avatar */}
                {!isMe && (
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                    {showAvatar ? msg.firstName?.[0]?.toUpperCase() : ""}
                  </div>
                )}

                {/* Bubble */}
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%] sm:max-w-[70%] group`}>
                  <div className="relative">
                    <div className={`px-3 sm:px-4 py-2 rounded-2xl shadow-lg ${isMe ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md" : "bg-gray-800 text-white rounded-bl-md border border-gray-700/50"}`}>
                      <p className="text-xs sm:text-sm leading-relaxed break-words">
                        {msg.message}
                        {msg.edited && <span className="text-[10px] opacity-60 ml-2">(edited)</span>}
                      </p>
                    </div>

                    {/* Edit/Delete — own messages only */}
                    {isMe && msg._id && (
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingMessageId(editingMessageId === msg._id ? null : msg._id!)}
                          className="p-1 bg-gray-700 rounded-full hover:bg-gray-600"
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>
                        {editingMessageId === msg._id && (
                          <div className="absolute right-0 mt-1 w-32 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                            <button
                              onClick={() => setEditingMessageId(msg._id!)}
                              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center gap-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg._id!)}
                              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500 mt-1 px-2">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>

                {/* My avatar */}
                {isMe && (
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                    {showAvatar ? user?.firstName?.[0]?.toUpperCase() : ""}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="bg-gray-800 border-t border-gray-700 p-3 max-h-60 overflow-y-auto">
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="text-2xl hover:bg-gray-700 rounded p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-t border-gray-700/50 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className={`flex-shrink-0 p-2 hover:bg-gray-700/50 rounded-lg transition-all ${showEmoji ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"}`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleTyping}
            className="flex-1 bg-gray-700/50 text-white placeholder-gray-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base border border-gray-700/30"
            placeholder="Type a message..."
          />

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className={`p-2.5 sm:p-3 rounded-full transition-all duration-200 flex-shrink-0 ${inputMessage.trim() ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transform hover:scale-105 active:scale-95" : "bg-gray-700/50 text-gray-500 cursor-not-allowed"}`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>

      {/* Edit Message Modal */}
      {editingMessageId && (
        <EditMessageModal
          messageId={editingMessageId}
          currentText={messages.find((m) => m._id === editingMessageId)?.message || ""}
          onSave={(newText) => handleEditMessage(editingMessageId, newText)}
          onCancel={() => setEditingMessageId(null)}
        />
      )}

      {/* Click outside to close */}
      {(showMenu || showEmoji) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowMenu(false);
            setShowEmoji(false);
          }}
        />
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
