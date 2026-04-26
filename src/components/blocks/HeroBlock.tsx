import React from 'react';

export default function HeroBlock({ content }: { content: any }) {
  const { headline, subheadline, backgroundColor, backgroundImage } = content;

  return (
    <section 
      className="relative w-full py-32 px-6 flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ 
        backgroundColor: backgroundColor || '#4f46e5',
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
      <div className="relative z-10 max-w-4xl mx-auto text-white">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-lg">
          {headline || 'Welcome'}
        </h1>
        {subheadline && (
          <p className="text-xl md:text-2xl opacity-90 drop-shadow-md max-w-2xl mx-auto">
            {subheadline}
          </p>
        )}
      </div>
    </section>
  );
}
