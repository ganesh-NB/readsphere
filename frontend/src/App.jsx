import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import BookDetails from './pages/BookDetails';
import Reader from './pages/Reader';
import Admin from './pages/Admin';

// Dummy Pages for routing skeleton
const Books = () => <div className="container" style={{paddingTop: '120px', minHeight: '80vh'}}><h1>Books Library</h1></div>;
const Dashboard = () => <div className="container" style={{paddingTop: '120px', minHeight: '80vh'}}><h1>User Dashboard</h1></div>;

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="/read/:id" element={<Reader />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/*" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
