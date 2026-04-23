import React, { useState } from 'react';
import { BookOpen, Heart, Bookmark, Settings, LogOut } from 'lucide-react';
import BookCard from '../components/BookCard';

const MOCK_FAVORITES = [
  { id: '1', title: 'The Silent Patient', author: 'Alex Michaelides', category: 'Thriller', rating: 4.5, coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800' },
  { id: '2', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', rating: 4.9, coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800' },
];

const MOCK_CURRENTLY_READING = [
  { id: '3', title: 'Dune', author: 'Frank Herbert', progress: 45, coverImage: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=800' }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('reading');

  const navItemClass = (tabId) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
    activeTab === tabId 
      ? 'bg-gradient-to-r from-orange-500/20 to-transparent text-orange-400 border-l-2 border-orange-500' 
      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent'
  }`;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 mt-20 min-h-[85vh]">
      <div className="flex flex-col lg:flex-row gap-8 relative">
        
        {/* Sidebar */}
        <aside className="lg:w-1/4 xl:w-1/5 flex-shrink-0">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-[#13192b]/60 sticky top-28 shadow-xl shadow-black/20">
            <div className="flex flex-col items-center text-center pb-8 border-b border-white/10 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-orange-500/30 mb-4 ring-4 ring-orange-500/10">
                JD
              </div>
              <h3 className="text-xl font-bold text-slate-100">John Doe</h3>
              <p className="text-slate-400 text-sm">john.doe@example.com</p>
            </div>
            
            <nav className="flex flex-col gap-2 mb-8">
              <button 
                className={navItemClass('reading')}
                onClick={() => setActiveTab('reading')}
              >
                <BookOpen size={20} className={activeTab === 'reading' ? 'text-orange-500' : ''} /> Currently Reading
              </button>
              <button 
                className={navItemClass('favorites')}
                onClick={() => setActiveTab('favorites')}
              >
                <Heart size={20} className={activeTab === 'favorites' ? 'text-orange-500' : ''} /> My Favorites
              </button>
              <button 
                className={navItemClass('bookmarks')}
                onClick={() => setActiveTab('bookmarks')}
              >
                <Bookmark size={20} className={activeTab === 'bookmarks' ? 'text-orange-500' : ''} /> Bookmarks
              </button>
              <button 
                className={navItemClass('settings')}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={20} className={activeTab === 'settings' ? 'text-orange-500' : ''} /> Account Settings
              </button>
            </nav>
            
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-red-400 hover:bg-red-400/10 hover:text-red-300 border border-transparent hover:border-red-400/20">
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="lg:w-3/4 xl:w-4/5">
          {activeTab === 'reading' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400"><BookOpen size={24} /></div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">Continue Reading</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {MOCK_CURRENTLY_READING.map(book => (
                  <div key={book.id} className="glass-panel p-4 rounded-2xl border border-white/5 bg-[#13192b]/40 hover:bg-[#13192b]/60 transition-colors group flex flex-col sm:flex-row gap-5">
                    <div className="w-full sm:w-1/3 aspect-[2/3] sm:aspect-auto rounded-xl overflow-hidden shadow-lg border border-white/10 flex-shrink-0">
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-grow flex flex-col justify-center">
                      <h3 className="text-lg font-bold text-slate-100 mb-1 line-clamp-2 leading-tight">{book.title}</h3>
                      <p className="text-slate-400 text-sm mb-4">by {book.author}</p>
                      
                      <div className="w-full">
                        <div className="flex justify-between text-xs font-medium mb-2">
                          <span className="text-slate-300">Progress</span>
                          <span className="text-orange-400">{book.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full relative" style={{width: `${book.progress}%`}}>
                            <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px]"></div>
                          </div>
                        </div>
                      </div>
                      
                      <button className="btn btn-primary w-full !py-2 !text-sm mt-5 !rounded-lg hover:shadow-orange-500/20">Resume Reading</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400"><Heart size={24} /></div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">My Favorites</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
                {MOCK_FAVORITES.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Bookmark size={24} /></div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">Saved Bookmarks</h2>
              </div>
              <div className="flex flex-col items-center justify-center py-20 bg-[#13192b]/40 border border-white/5 rounded-3xl border-dashed">
                <div className="w-20 h-20 rounded-full bg-blue-500/5 flex items-center justify-center mb-4">
                  <Bookmark size={32} className="text-blue-500/50" />
                </div>
                <p className="text-slate-400 font-medium text-lg">You haven't saved any highlights or bookmarks yet.</p>
                <p className="text-slate-500">Read books and bookmark pages to see them here.</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-slate-500/10 text-slate-400"><Settings size={24} /></div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">Account Settings</h2>
              </div>
              <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-[#13192b]/40 max-w-2xl">
                <p className="text-slate-400 text-lg text-center py-10 border border-slate-700/50 rounded-2xl border-dashed">Profile update options will go here.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
