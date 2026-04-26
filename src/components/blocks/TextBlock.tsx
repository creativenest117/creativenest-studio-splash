import React from 'react';

export default function TextBlock({ content }: { content: any }) {
  const { text } = content;

  return (
    <section className="w-full py-16 px-6 bg-white flex justify-center">
      <div className="max-w-3xl w-full prose prose-lg prose-blue text-gray-800">
        <p className="leading-relaxed whitespace-pre-wrap">
          {text || 'Add some text to this block from the Studio builder.'}
        </p>
      </div>
    </section>
  );
}
