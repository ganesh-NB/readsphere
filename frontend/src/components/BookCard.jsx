import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen } from 'lucide-react';

const BookCard = ({ book }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="group relative bg-[#111111] backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-red-500/20 hover:border-red-500/40 transition-all duration-500 flex flex-col h-full transform hover:-translate-y-2">
      {/* Red glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 via-transparent to-transparent"></div>
      </div>
      
      <div className="relative aspect-[2/3] overflow-hidden bg-[#0a0a0a]">
        {/* Skeleton placeholder while image loads */}
        {!imgLoaded && <div className="absolute inset-0 skeleton"></div>}
        <img 
          src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'} 
          alt={book.title} 
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
        />
        
        {/* Rating badge */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          <div className="flex flex-col gap-2">
            {book.rating && (
              <span className="inline-flex items-center gap-1.5 bg-black/80 backdrop-blur-md text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-500/30 shadow-lg shadow-red-500/10">
                <Star size={14} className="fill-red-500 text-red-500" />
                {typeof book.rating === 'number' ? book.rating.toFixed(1) : book.rating}
              </span>
            )}
          </div>
        </div>

        {/* Hover overlay with Read Now button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-8">
          {book.fileUrl ? (
            <Link 
              to={`/read/${book._id || book.id}`} 
              state={{ fileUrl: book.fileUrl }}
              className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 btn btn-primary !py-3 !px-6 !text-sm flex items-center gap-2"
            >
              <BookOpen size={18} /> Read Now
            </Link>
          ) : (
            <Link 
              to={`/book/${book._id || book.id}`} 
              className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 btn btn-primary !py-3 !px-6 !text-sm flex items-center gap-2"
            >
              <BookOpen size={18} /> View Details
            </Link>
          )}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col justify-between gap-3 bg-gradient-to-b from-[#111111] to-[#0a0a0a]">
        <div>
          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
              {book.category?.name || book.category || 'General'}
            </span>
          </div>
          <h3 className="text-base font-bold text-white line-clamp-2 leading-tight group-hover:text-red-400 transition-colors duration-300" title={book.title}>
            {book.title}
          </h3>
        </div>
        <p className="text-sm text-neutral-500 truncate">by <span className="text-neutral-300">{book.author || 'Unknown'}</span></p>
      </div>
    </div>
  );
};

export default BookCard;
