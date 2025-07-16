import React from 'react';
import { X, User } from 'lucide-react';
import { User as UserType } from '../types';

interface PlayersManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
}

const PlayersManagementModal: React.FC<PlayersManagementModalProps> = ({
  isOpen,
  onClose,
  users
}) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Gestion des joueurs</h2>
            <button 
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-all duration-300 hover:scale-105"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            {users.map((user, index) => (
              <div key={user.id} className="rounded-xl p-4 border-2 transition-all duration-300 bg-gray-50 border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {user.username}
                        {index === 0 && <span className="text-green-600 ml-2">(Créateur)</span>}
                      </p>
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border bg-blue-50 border-blue-300 text-blue-800">
                        <User className="w-4 h-4" />
                        <span>Joueur</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayersManagementModal;