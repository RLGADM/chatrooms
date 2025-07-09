import React, { useState, useRef, useEffect } from 'react';
import { Copy, Send, Users, LogOut, Check } from 'lucide-react';
import { Room as RoomType, User, Message } from '../types';

interface RoomProps {
  room: RoomType;
  currentUser: User;
  onSendMessage: (message: string) => void;
  onLeaveRoom: () => void;
}

const Room: React.FC<RoomProps> = ({ room, currentUser, onSendMessage, onLeaveRoom }) => {
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [room.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">Code du salon:</span>
              <div className="flex items-center space-x-2">
                <code className="bg-gray-100 px-3 py-1 rounded-md font-mono text-lg font-bold text-blue-600">
                  {room.code}
                </code>
                <button
                  onClick={copyRoomCode}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  title="Copier le code"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={onLeaveRoom}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Quitter</span>
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full flex">
        {/* Users sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">
              Connectés ({room.users.length})
            </h3>
          </div>
          
          <div className="space-y-2">
            {room.users.map((user) => (
              <div
                key={user.id}
                className={`p-3 rounded-lg ${
                  user.id === currentUser.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={`font-medium ${
                    user.id === currentUser.id ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {user.username}
                    {user.id === currentUser.id && ' (vous)'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {room.messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Aucun message pour le moment.</p>
                  <p className="text-sm">Soyez le premier à envoyer un message !</p>
                </div>
              ) : (
                room.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.username === currentUser.username ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                        msg.username === currentUser.username
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      } rounded-lg p-3 shadow-sm`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${
                          msg.username === currentUser.username
                            ? 'text-blue-100'
                            : 'text-gray-600'
                        }`}>
                          {msg.username}
                        </span>
                        <span className={`text-xs ${
                          msg.username === currentUser.username
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm break-words">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tapez votre message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;