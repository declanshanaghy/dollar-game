import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import { ThemeProvider } from './contexts/ThemeContext';
import { trackPageView } from './services/analyticsService';

// Component to track page views
const PageViewTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);
  
  return null;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        {/* Track page views */}
        <PageViewTracker />
        
        {/* 🌌 C0sm1c r0ut1ng p0rt4l 🌌 */}
        <Routes>
          {/* 🏠 M41n g4m3 3xp3r13nc3 */}
          <Route path="/" element={<HomePage />} />
          
          {/* 🔮 F4llb4ck f0r c0sm1c w4nd3r3rs */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
