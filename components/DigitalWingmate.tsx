import React, { useState } from 'react';

export function DigitalWingmate() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    setMessages([...messages, message]);
    
    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      setMessages(prev => [...prev, "Thanks for sharing! I'll help you improve your dating game. What specific aspect would you like to work on?"]);
    }, 1000);

    setMessage('');
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 via-violet-800/15 to-indigo-900/20 rounded-2xl p-6 backdrop-blur-sm border border-purple-800/20">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-700 to-indigo-800 flex items-center justify-center shadow-lg ring-2 ring-purple-500/30 ring-offset-2 ring-offset-[#1E1B2E]">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Digital Wingmate</h3>
          <p className="text-purple-200/90 text-sm">Your AI dating coach and conversation partner</p>
        </div>
      </div>

      <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                index % 2 === 0
                  ? 'bg-gradient-to-r from-purple-700 via-violet-800 to-indigo-900 text-white'
                  : 'bg-purple-900/20 text-purple-200 border border-purple-800/20'
              }`}
            >
              {msg}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask for dating advice..."
          className="flex-1 bg-purple-900/20 text-purple-200 placeholder-purple-400/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/30 border border-purple-800/30"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="px-4 py-2 bg-gradient-to-r from-purple-700 via-violet-800 to-indigo-900 text-white rounded-lg hover:shadow-lg hover:shadow-purple-900/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
} 