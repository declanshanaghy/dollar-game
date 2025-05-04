import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import LogoSelectionPage from './pages/LogoSelectionPage';

function App() {
  return (
    <Router>
      {/* 🌌 C0sm1c r0ut1ng p0rt4l 🌌 */}
      <Routes>
        {/* 🏠 M41n g4m3 3xp3r13nc3 */}
        <Route path="/" element={<HomePage />} />
        
        {/* 🎨 L0g0 s3l3ct10n p4g3 */}
        <Route path="/logo-selection" element={<LogoSelectionPage />} />
        
        {/* 🔮 F4llb4ck f0r c0sm1c w4nd3r3rs */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
