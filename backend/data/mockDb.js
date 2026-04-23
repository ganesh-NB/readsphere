// In-memory mock data
const MOCK_USERS = [
  { _id: 'u1', username: 'admin', email: 'admin@readsphere.com', password: '$2b$10$YourHashedPasswordHere', role: 'admin', favorites: [], bookmarks: [] },
  { _id: 'u2', username: 'user1', email: 'user@example.com', password: '$2b$10$YourHashedPasswordHere', role: 'user', favorites: ['b1', 'b2'], bookmarks: [{ book: 'b3', page: 45 }] }
];

const MOCK_BOOKS = [
  { _id: 'b1', title: 'The Silent Patient', author: 'Alex Michaelides', category: 'c1', description: 'A psychological thriller...', coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800', rating: 4.5, fileUrl: null },
  { _id: 'b2', title: 'Atomic Habits', author: 'James Clear', category: 'c2', description: 'Self-help book...', coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800', rating: 4.9, fileUrl: null },
  { _id: 'b3', title: 'Dune', author: 'Frank Herbert', category: 'c3', description: 'Classic sci-fi...', coverImage: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=800', rating: 4.8, fileUrl: null },
  // Public domain books with actual PDF URLs for testing
  { 
    _id: 'b4', 
    title: 'The Great Gatsby', 
    author: 'F. Scott Fitzgerald', 
    category: 'c1', 
    description: 'The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, the novel depicts narrator Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby and Gatsby\'s obsession to reunite with his former lover, Daisy Buchanan.', 
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800', 
    rating: 4.4, 
    fileUrl: 'https://www.gutenberg.org/files/64317/64317-pdf.pdf' 
  },
  { 
    _id: 'b5', 
    title: 'Pride and Prejudice', 
    author: 'Jane Austen', 
    category: 'c1', 
    description: 'Pride and Prejudice is an 1813 novel of manners by Jane Austen. The novel follows the character development of Elizabeth Bennet, the dynamic protagonist of the book who learns about the repercussions of hasty judgments and comes to appreciate the difference between superficial goodness and actual goodness.', 
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800', 
    rating: 4.6, 
    fileUrl: 'https://www.gutenberg.org/files/1342/1342-pdf.pdf' 
  },
  { 
    _id: 'b6', 
    title: 'The Adventures of Sherlock Holmes', 
    author: 'Arthur Conan Doyle', 
    category: 'c1', 
    description: 'The Adventures of Sherlock Holmes is a collection of twelve short stories by Arthur Conan Doyle, first published on 14 October 1892. It contains the earliest short stories featuring the consulting detective Sherlock Holmes.', 
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=800', 
    rating: 4.5, 
    fileUrl: 'https://www.gutenberg.org/files/1661/1661-pdf.pdf' 
  }
];

const MOCK_CATEGORIES = [
  { _id: 'c1', name: 'Thriller' },
  { _id: 'c2', name: 'Self-Help' },
  { _id: 'c3', name: 'Sci-Fi' }
];

module.exports = { MOCK_USERS, MOCK_BOOKS, MOCK_CATEGORIES };
