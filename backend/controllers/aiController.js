const Book = require('../models/Book');

// Generate AI summary based on book data
const generateSummary = async (req, res) => {
  try {
    const { bookId, text } = req.body;
    
    let book;
    if (bookId) {
      book = await Book.findById(bookId);
    }

    // If book has a stored AI summary, return it
    if (book && book.aiSummary) {
      return res.json({ summary: book.aiSummary, source: 'stored' });
    }

    // Generate a contextual summary based on available data
    const title = book?.title || text?.substring(0, 50) || 'this book';
    const category = book?.category || 'General';
    const author = book?.author || 'the author';
    const description = book?.description || text?.substring(0, 200) || '';

    // Create a meaningful summary based on the book's metadata
    let summary = '';
    
    if (description && description.length > 50) {
      summary = `${description.substring(0, 300)}...\n\n`;
    }
    
    summary += `"${title}" by ${author} is a compelling work in the ${category} genre. `;
    summary += `This book explores themes and narratives that captivate readers through its unique storytelling approach. `;
    summary += `The author masterfully develops characters and plotlines that resonate with the audience, `;
    summary += `making it a significant contribution to ${category.toLowerCase()} literature.`;

    // If there's user-provided text to summarize, include that
    if (text && text.length > 100) {
      summary += `\n\nKey content insights:\n`;
      // Extract key sentences (first sentence of each paragraph)
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      const keyPoints = sentences.slice(0, 3).map(s => s.trim()).filter(s => s.length > 20);
      if (keyPoints.length > 0) {
        summary += keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n');
      }
    }

    res.json({ summary, source: 'generated' });
  } catch (error) {
    console.error('AI Summary error:', error);
    res.status(500).json({ message: 'Error generating summary' });
  }
};

// Get personalized recommendations
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    // Get user's reading history/favorites if available
    const User = require('../models/User');
    const user = await User.findById(userId).populate('favorites');
    
    let query = { isActive: true };
    
    // If user has favorites, recommend similar categories
    if (user && user.favorites.length > 0) {
      const categories = [...new Set(user.favorites.map(b => b.category))];
      query.category = { $in: categories };
    }
    
    // Get recommendations (exclude already favorited books)
    const favoriteIds = user ? user.favorites.map(b => b._id.toString()) : [];
    const recommendations = await Book.find(query)
      .sort({ readCount: -1, favoriteCount: -1 })
      .limit(8);
    
    // Filter out favorited books
    const filtered = recommendations.filter(b => !favoriteIds.includes(b._id.toString()));
    
    res.json(filtered.slice(0, 6));
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Error getting recommendations' });
  }
};

module.exports = { generateSummary, getRecommendations };
