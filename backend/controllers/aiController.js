const { MOCK_BOOKS } = require('../data/mockDb');

const generateSummary = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = MOCK_BOOKS.find(b => b._id === bookId) || { title: 'Unknown Book', category: 'General' };

    const mockSummary = `This is a smart AI-generated summary for "${book.title}". The text masterfully delves into core themes associated with the ${book.category} genre. It breaks down complex ideas into digestible insights, making it perfect for quick review. Key takeaways predict an emphasis on sustained character growth and thematic depth.`;
    
    res.json({ summary: mockSummary });
  } catch (error) {
    res.status(500).json({ message: 'Error generating summary' });
  }
};

const getRecommendations = async (req, res) => {
  try {
    // Simulated mock recommendations (just return first 4 books)
    const recommendedBooks = MOCK_BOOKS.slice(0, 4);
    res.json(recommendedBooks);
  } catch (error) {
    res.status(500).json({ message: 'Error getting recommendations' });
  }
};

module.exports = { generateSummary, getRecommendations };
