import React from 'react';
import Image from 'next/image';

interface SmartLink {
  id: string;
  url: string;
  title?: string;
  bannerImage?: string;
  type?: string;
}

export default function LinksBlock({ links, domain }: { links: SmartLink[], domain: string }) {
  if (!links || links.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-4">
        {links.map((link) => {
          // Resolve correct URL
          const linkHref = link.url && link.url.trim() !== "" 
            ? link.url 
            : `https://${domain}.creativenest.app/${link.id}`;

          return (
            <div key={link.id} className="relative group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1500ms] pointer-events-none z-10" />
              
              <a href={linkHref} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20"></a>

              <div className="flex flex-col sm:flex-row items-center p-4 gap-5 relative z-30 pointer-events-none">
                <div className="relative h-24 w-full sm:w-36 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-inner">
                  <Image
                    src={link.bannerImage || "/default_banner.png"}
                    alt={link.title || "Page Component"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  {link.type === 'tv' && (
                     <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                       TV
                     </div>
                  )}
                </div>
                <div className="flex-grow text-center sm:text-left mt-3 sm:mt-0 w-full px-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2">{link.title || "Untitled Link"}</h3>
                </div>
                <div
                  className="mt-4 sm:mt-0 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl transition-colors shadow-md group-hover:bg-gray-800 dark:group-hover:bg-gray-100 shrink-0 pointer-events-auto cursor-pointer"
                >
                  Visit
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
