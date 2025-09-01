import React from 'react';
import { BsEmojiSmile, BsSticky } from "react-icons/bs";

const StickerPicker = ({ onStickerSelect, onClose }) => {
  // Sample stickers - in production, these would come from a sticker pack API
  const stickers = [
    { id: 1, url: 'https://via.placeholder.com/64x64/FF6B6B/FFFFFF?text=😀', name: 'Happy' },
    { id: 2, url: 'https://via.placeholder.com/64x64/4ECDC4/FFFFFF?text=😍', name: 'Love' },
    { id: 3, url: 'https://via.placeholder.com/64x64/45B7D1/FFFFFF?text=😂', name: 'Laugh' },
    { id: 4, url: 'https://via.placeholder.com/64x64/96CEB4/FFFFFF?text=😎', name: 'Cool' },
    { id: 5, url: 'https://via.placeholder.com/64x64/FFEAA7/FFFFFF?text=🎉', name: 'Party' },
    { id: 6, url: 'https://via.placeholder.com/64x64/DDA0DD/FFFFFF?text=💖', name: 'Heart' },
    { id: 7, url: 'https://via.placeholder.com/64x64/98D8C8/FFFFFF?text=👍', name: 'Thumbs Up' },
    { id: 8, url: 'https://via.placeholder.com/64x64/F7DC6F/FFFFFF?text=🌟', name: 'Star' },
  ];

  const handleStickerClick = (sticker) => {
    onStickerSelect(sticker.url);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <BsSticky />
            Stickers
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {stickers.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => handleStickerClick(sticker)}
              className="p-2 rounded hover:bg-gray-700 transition-colors group"
              title={sticker.name}
            >
              <div className="w-16 h-16 mx-auto mb-2 rounded overflow-hidden">
                <img
                  src={sticker.url}
                  alt={sticker.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-gray-300 text-center group-hover:text-white">
                {sticker.name}
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Click on a sticker to send it
          </p>
        </div>
      </div>
    </div>
  );
};

export default StickerPicker;
