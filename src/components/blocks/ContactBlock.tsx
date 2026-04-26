import React from 'react';

export default function ContactBlock({ content }: { content: any }) {
  const { title, email } = content;

  return (
    <section className="w-full py-20 px-6 bg-white flex flex-col items-center">
      <div className="max-w-xl w-full">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{title || 'Contact Me'}</h2>
        
        <form className="space-y-6 bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 h-32" 
              placeholder="How can I help you?"
            ></textarea>
          </div>
          <button 
            type="button" 
            className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-lg transition-colors shadow-md"
            onClick={() => alert(`Message would be sent to: ${email || "default creator"}`)}
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
