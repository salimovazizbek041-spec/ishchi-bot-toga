import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FaPaperPlane, FaUser, FaArrowLeft, FaCheckDouble,
  FaCheck, FaPhone, FaMapMarkerAlt, FaStar 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showChatList, setShowChatList] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    
    // Auto-select chat if userId provided in URL
    const userId = searchParams.get('userId');
    if (userId) {
      openChat(userId);
      setShowChatList(false);
    }
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      const interval = setInterval(() => fetchMessages(selectedChat._id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Conversations fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await api.get(`/messages/conversation/${userId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Messages fetch error:', error);
    }
  };

  const openChat = async (userId) => {
    try {
      // Get user info from conversations or fetch it
      let chatUser = conversations.find(c => c._id._id === userId);
      
      if (!chatUser) {
        const response = await api.get(`/search/usta/${userId}`);
        chatUser = { _id: response.data.usta };
      }
      
      setSelectedChat(chatUser._id);
      setShowChatList(false);
      
      // Mark messages as read
      await fetchMessages(userId);
      fetchConversations();
    } catch (error) {
      console.error('Open chat error:', error);
      toast.error('Chat ochishda xatolik');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await api.post('/messages/send', {
        receiverId: selectedChat._id,
        content: newMessage.trim()
      });

      setMessages([...messages, response.data.data]);
      setNewMessage('');
      fetchConversations();
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Xabar yuborishda xatolik');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Xabarlar yuklanmoqda..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 100px)' }}>
          <div className="flex h-full">
            {/* Chat List */}
            <div className={`${
              showChatList ? 'w-full' : 'hidden'
            } md:w-80 md:block border-r border-gray-200`}>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Xabarlar</h2>
              </div>
              
              <div className="overflow-y-auto" style={{ height: 'calc(100% - 65px)' }}>
                {conversations.length > 0 ? (
                  conversations.map(conv => (
                    <div
                      key={conv._id._id}
                      onClick={() => openChat(conv._id._id)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-purple-50 transition-all ${
                        selectedChat?._id === conv._id._id ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {conv._id.name?.charAt(0) || 'U'}
                          </div>
                          {conv.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                              {conv.unreadCount}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-800 truncate">
                              {conv._id.name}
                            </h3>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatTime(conv.lastMessage.createdAt)}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            {conv._id.profession && (
                              <span className="truncate">{conv._id.profession}</span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {conv.lastMessage.sender === user.id ? 'Siz: ' : ''}
                            {conv.lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 px-4">
                    <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Hozircha xabarlar yo'q</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Usta toping va bog'laning
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`${
              !showChatList ? 'w-full' : 'hidden'
            } md:flex md:flex-col flex-1`}>
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => {
                          setShowChatList(true);
                          setSelectedChat(null);
                        }}
                        className="md:hidden text-gray-600 hover:text-purple-600"
                      >
                        <FaArrowLeft className="text-xl" />
                      </button>
                      
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedChat.name?.charAt(0) || 'U'}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{selectedChat.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 space-x-3">
                          {selectedChat.profession && (
                            <span>{selectedChat.profession}</span>
                          )}
                          {selectedChat.region && (
                            <span className="flex items-center">
                              <FaMapMarkerAlt className="mr-1 text-red-400" />
                              {selectedChat.region}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg, index) => (
                      <div
                        key={msg._id || index}
                        className={`flex ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${
                          msg.sender === user.id
                            ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'
                            : 'bg-white text-gray-800'
                        } rounded-2xl px-4 py-2 shadow-sm`}>
                          <p>{msg.content}</p>
                          <div className={`flex items-center justify-end space-x-1 mt-1 ${
                            msg.sender === user.id ? 'text-white/70' : 'text-gray-400'
                          }`}>
                            <span className="text-xs">
                              {formatTime(msg.createdAt)}
                            </span>
                            {msg.sender === user.id && (
                              msg.read ? 
                                <FaCheckDouble className="text-xs" /> : 
                                <FaCheck className="text-xs" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <form onSubmit={sendMessage} className="flex space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Xabar yozing..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
                      >
                        <FaPaperPlane />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">
                      Suhbat tanlang
                    </h3>
                    <p className="text-gray-500">
                      Chapdan suhbatdoshni tanlang
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;