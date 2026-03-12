// In-memory mock data
const MOCK_USERS = [
  { _id: 'u1', username: 'admin', email: 'admin@readsphere.com', password: '$2b$10$YourHashedPasswordHere', role: 'admin', favorites: [], bookmarks: [] },
  { _id: 'u2', username: 'user1', email: 'user@example.com', password: '$2b$10$YourHashedPasswordHere', role: 'user', favorites: ['b1', 'b2'], bookmarks: [{ book: 'b3', page: 45 }] }
];

const MOCK_BOOKS = [
  { _id: 'b1', title: 'The Silent Patient', author: 'Alex Michaelides', category: 'c1', description: 'A psychological thriller...', coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800', rating: 4.5, fileUrl: '#' },
  { _id: 'b2', title: 'Atomic Habits', author: 'James Clear', category: 'c2', description: 'Self-help book...', coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800', rating: 4.9, fileUrl: '#' },
  { _id: 'b3', title: 'Dune', author: 'Frank Herbert', category: 'c3', description: 'Classic sci-fi...', coverImage: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=800', rating: 4.8, fileUrl: '#' }
];

const MOCK_CATEGORIES = [
  { _id: 'c1', name: 'Thriller' },
  { _id: 'c2', name: 'Self-Help' },
  { _id: 'c3', name: 'Sci-Fi' }
];

module.exports = { MOCK_USERS, MOCK_BOOKS, MOCK_CATEGORIES };
