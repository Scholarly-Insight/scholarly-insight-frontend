import React, { useState } from 'react';
import ChatInput from '../ui/ChatInput';
import SuggestionChip from '../ui/SuggestionChip';

interface ChatAreaProps {
  className?: string;
}

const suggestionsData = [
  { text: 'Inspire me', onClick: () => console.log('Inspire me clicked') },
  { text: 'Write a travel blog', subtext: 'on Paris', onClick: () => console.log('Travel blog clicked') },
  { text: 'Save me time', onClick: () => console.log('Save time clicked') },
  { text: 'Help me plan', onClick: () => console.log('Help plan clicked') },
];

const ChatArea: React.FC<ChatAreaProps> = ({
  className = '',
}) => {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);

  const handleSendMessage = (message: string) => {
    setMessages([...messages, { text: message, sender: 'user' }]);
    // In a real app, you would send the message to an API and get a response
    // For this demo, we'll just echo it back
    setTimeout(() => {
      setMessages(prev => [...prev, { text: `You said: ${message}`, sender: 'bot' }]);
    }, 1000);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-center mb-2">
              <span className="text-black">Meet </span>
              <span className="gemini-logo-text">Gemini</span>
              <span className="text-black">,</span>
            </h1>
            <p className="text-4xl font-bold text-center text-black">
              your personal AI assistant
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
            {suggestionsData.map((suggestion, index) => (
              <SuggestionChip
                key={index}
                text={suggestion.text}
                subtext={suggestion.subtext}
                onClick={suggestion.onClick}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg max-w-3xl ${
                message.sender === 'user'
                  ? 'bg-gemini-hoverBg ml-auto'
                  : 'bg-white border border-gemini-borderColor'
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-6 max-w-3xl mx-auto w-full">
        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatArea;
