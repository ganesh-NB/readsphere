const { MOCK_BOOKS, MOCK_CATEGORIES } = require('../data/mockDb');

const getBooks = async (req, res) => {
  try {
    let filteredBooks = [...MOCK_BOOKS];
    
    if (req.query.keyword) {
      const kw = req.query.keyword.toLowerCase();
      filteredBooks = filteredBooks.filter(b => 
        b.title.toLowerCase().includes(kw) || 
        b.author.toLowerCase().includes(kw)
      );
    }
    
    if (req.query.category) {
      filteredBooks = filteredBooks.filter(b => b.category === req.query.category);
    }

    // Populate category names manually
    const populatedBooks = filteredBooks.map(book => {
      const cat = MOCK_CATEGORIES.find(c => c._id === book.category);
      return { ...book, category: cat || { name: 'General'} };
    });

    res.json(populatedBooks);
  } catch (error) {
    res.status(500).json({ message: 'Error getting books' });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = MOCK_BOOKS.find(b => b._id === req.params.id);

    if (book) {
      const cat = MOCK_CATEGORIES.find(c => c._id === book.category);
      res.json({ ...book, category: cat || { name: 'General' } });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error getting book detail' });
  }
};

const createBook = async (req, res) => {
  try {
    const { title, author, description, category, coverImage, fileUrl } = req.body;

    const newBook = {
      _id: `b${MOCK_BOOKS.length + 1}`,
      title,
      author,
      description,
      category,
      coverImage,
      fileUrl,
      rating: 0
    };

    MOCK_BOOKS.push(newBook);
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: 'Error creating book' });
  }
};

module.exports = { getBooks, getBookById, createBook };
