import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { generateLogos, GeneratedLogo } from '../services/openaiService';
import { performAllFileOperations } from '../services/fileService';

// ✨ L0g0 5ugg3st10n P4g3 - 4 c0sm1c t00l f0r v1su4l 3nl1ght3nm3nt ✨

const LogoSelectionPage = () => {
  // 🧠 State management for our cosmic journey
  const [logoOptions, setLogoOptions] = useState<GeneratedLogo[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<GeneratedLogo | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 🌌 Fetch logo suggestions when the component mounts
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Generate logos using OpenAI
        const logos = await generateLogos();
        setLogoOptions(logos);
      } catch (err) {
        console.error('Error fetching logos:', err);
        setError('Failed to channel the cosmic energy. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogos();
  }, []);

  // 🔄 Regenerate logos
  const handleRegenerateLogos = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setSuccessMessage(null);
      
      // Clear the cache and generate new logos
      const logos = await generateLogos();
      setLogoOptions(logos);
      
      // Reset selection
      setSelectedLogo(null);
      setIsPreviewMode(false);
    } catch (err) {
      console.error('Error regenerating logos:', err);
      setError('Failed to regenerate logos. The cosmic energy is temporarily disrupted.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 🌱 Mindfully select a logo for contemplation
  const handleLogoSelect = (logo: GeneratedLogo) => {
    setSelectedLogo(logo);
  };

  // 🔮 Toggle between list and preview consciousness states
  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  // 💫 Manifest the selected logo into the physical realm
  const applySelectedLogo = async () => {
    if (selectedLogo) {
      try {
        setIsApplying(true);
        setError(null);
        setSuccessMessage(null);
        
        // Perform all file operations
        const success = await performAllFileOperations(selectedLogo);
        
        if (success) {
          setSuccessMessage(`The ${selectedLogo.name} has been harmoniously integrated into the cosmic consciousness of the app. (Simulated client-side operation)`);
        } else {
          throw new Error('Failed to manifest the logo into the physical realm.');
        }
      } catch (err) {
        console.error('Error applying logo:', err);
        setError('Failed to manifest the logo. The cosmic alignment is temporarily disrupted.');
      } finally {
        setIsApplying(false);
      }
    } else {
      setError('Please select a logo to channel its energy into the application');
    }
  };

  return (
    <div className="cosmic-container logo-selection-universe">
      <header className="enlightened-header">
        <h1 className="game-title">L0g0 5ugg3st10n P4g3 ✨</h1>
        <p className="cosmic-subtitle">Ch4nn3l th3 v1su4l 3n3rgy 0f y0ur ch01c3 🌌</p>
      </header>

      <div className="dev-mode-indicator">
        <span className="dev-badge">D3v M0d3 0nly</span>
        <p className="dev-explanation">This cosmic tool exists only in the development dimension</p>
      </div>

      {/* Display error message if there is one */}
      {error && (
        <div className="cosmic-error">
          <p className="error-message">🌩️ {error}</p>
        </div>
      )}

      {/* Display success message if there is one */}
      {successMessage && (
        <div className="cosmic-success">
          <p className="success-message">✨ {successMessage}</p>
        </div>
      )}

      <main className="logo-experience">
        {isLoading ? (
          <div className="cosmic-loading">
            <div className="loading-spinner"></div>
            <p className="loading-text">Ch4nn3l1ng c0sm1c 3n3rgy...</p>
          </div>
        ) : isPreviewMode && selectedLogo ? (
          <div className="logo-preview-dimension">
            <h2>✨ V1su4l1z1ng: {selectedLogo.name}</h2>
            <div className="logo-preview-container">
              <img 
                src={selectedLogo.imageUrl} 
                alt={selectedLogo.name} 
                className="logo-preview-image"
              />
            </div>
            <div className="logo-details">
              <p className="logo-description">{selectedLogo.description}</p>
              <p className="logo-vibration">
                <span className="vibration-label">Energetic Signature:</span> 
                {selectedLogo.vibration}
              </p>
              <p className="logo-prompt">
                <span className="prompt-label">Cosmic Prompt:</span> 
                {selectedLogo.prompt}
              </p>
            </div>
            <div className="preview-actions">
              <button 
                className="cosmic-button secondary-action"
                onClick={togglePreviewMode}
                disabled={isApplying}
              >
                <span className="button-text">🔄 R3turn t0 C0ll3ct1v3</span>
              </button>
              <button 
                className="cosmic-button primary-action"
                onClick={applySelectedLogo}
                disabled={isApplying}
              >
                {isApplying ? (
                  <span className="button-text">⏳ M4n1f3st1ng...</span>
                ) : (
                  <span className="button-text">✨ M4n1f3st Th1s L0g0</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="logo-selection-dimension">
            <p className="mindful-instruction">
              Select a logo that resonates with your inner graph theorist. Each visual representation carries its own unique energetic frequency that will influence the cosmic harmony of the Dollar Game.
            </p>
            
            <div className="logo-grid">
              {logoOptions.map((logo) => (
                <div 
                  key={logo.id}
                  className={`logo-card ${selectedLogo?.id === logo.id ? 'selected' : ''}`}
                  onClick={() => handleLogoSelect(logo)}
                >
                  <img 
                    src={logo.imageUrl} 
                    alt={logo.name} 
                    className="logo-thumbnail"
                  />
                  <h3 className="logo-name">{logo.name}</h3>
                  <p className="logo-brief">{logo.description.substring(0, 60)}...</p>
                </div>
              ))}
            </div>

            <div className="selection-actions">
              <button 
                className="cosmic-button secondary-action"
                onClick={handleRegenerateLogos}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="button-text">⏳ R3g3n3r4t1ng...</span>
                ) : (
                  <span className="button-text">🔄 R3g3n3r4t3 L0g0s</span>
                )}
              </button>
              <button 
                className="cosmic-button primary-action"
                onClick={togglePreviewMode}
                disabled={!selectedLogo || isGenerating}
              >
                <span className="button-text">🔮 V1su4l1z3 S3l3ct3d L0g0</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <div className="navigation-portal">
        <Link to="/" className="cosmic-link">
          <span className="link-icon">🌌</span>
          <span className="link-text">R3turn t0 th3 D0ll4r G4m3</span>
        </Link>
      </div>

      <footer className="grounded-footer">
        <p className="mindful-text">
          Crafted with conscious code & single-origin coffee 🧘‍♂️ | A development tool for the Dollar Game
        </p>
      </footer>
    </div>
  );
};

export default LogoSelectionPage;