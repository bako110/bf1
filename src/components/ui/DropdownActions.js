import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2, MessageSquare, Heart, Star } from 'lucide-react';

export default function DropdownActions({ items, onAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'edit':
        return <Edit2 className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'comments':
        return <MessageSquare className="w-4 h-4" />;
      case 'like':
        return <Heart className="w-4 h-4" />;
      case 'favorite':
        return <Star className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleAction = (action) => {
    setIsOpen(false);
    if (onAction) {
      onAction(action);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        title="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleAction(item.action)}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  item.className || 'text-gray-700'
                }`}
              >
                {item.icon && getIcon(item.icon)}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
