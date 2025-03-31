import React, { useState } from 'react';
import { MicrophoneIcon , PlusIcon } from '../icons/Icons';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = 'Ask Gemini',
  className = '',
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="flex items-center bg-white border border-gemini-borderColor rounded-full px-4 py-1 shadow-sm hover:shadow-gemini-button transition-shadow">
        <button
          type="button"
          className="text-gemini-secondaryText p-2 rounded-full hover:bg-gemini-hoverBg"
        >
          <PlusIcon size={20} />
        </button>

        <textarea
          rows={1}
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 outline-none border-none py-2 px-3 resize-none h-10 leading-tight overflow-hidden text-gemini-text placeholder:text-gemini-secondaryText"
        />

        <button
          type="button"
          className="text-gemini-secondaryText p-2 rounded-full hover:bg-gemini-hoverBg"
        >
          <MicrophoneIcon size={20} />
        </button>
      </div>

      <div className="text-xs text-center text-gemini-secondaryText mt-2">
        <span>Google </span>
        <a href="#" className="underline hover:text-gemini-blue">Terms</a>
        <span> and the </span>
        <a href="#" className="underline hover:text-gemini-blue">Google Privacy Policy</a>
        <span> apply. Gemini can make mistakes, so double-check it.</span>
      </div>
    </form>
  );
};

export default ChatInput;
