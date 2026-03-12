const { MOCK_USERS } = require('../data/mockDb');

const addFavorite = async (req, res) => {
  try {
    const { bookId } = req.body;
    const user = MOCK_USERS.find(u => u._id === req.user.id);
    
    if (user.favorites.includes(bookId)) {
      return res.status(400).json({ message: 'Book already in favorites' });
    }
    
    user.favorites.push(bookId);
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to favorites' });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const user = MOCK_USERS.find(u => u._id === req.user.id);
    user.favorites = user.favorites.filter(id => id !== req.params.bookId);
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error removing from favorites' });
  }
};

const addBookmark = async (req, res) => {
  try {
    const { bookId, page } = req.body;
    const user = MOCK_USERS.find(u => u._id === req.user.id);
    
    user.bookmarks.push({ book: bookId, page });
    res.json(user.bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Error adding bookmark' });
  }
};

module.exports = { addFavorite, removeFavorite, addBookmark };
