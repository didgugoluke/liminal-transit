import { useState } from 'react';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { StoryInterface } from './components/story/StoryInterface';
import { ObservatoryDashboard } from './components/observatory/ObservatoryDashboard';
import './App.css';

function App() {
  // Extract seed from URL params if present
  const urlParams = new URLSearchParams(window.location.search);
  const seedFromUrl = urlParams.get('seed') || undefined;
  const observatoryMode = urlParams.get('observatory') === 'true';
  
  const [showObservatory, setShowObservatory] = useState(observatoryMode);

  // Toggle between story interface and observatory dashboard
  const toggleMode = () => {
    setShowObservatory(!showObservatory);
    // Update URL to reflect current mode
    const newUrl = new URL(window.location.href);
    if (!showObservatory) {
      newUrl.searchParams.set('observatory', 'true');
    } else {
      newUrl.searchParams.delete('observatory');
    }
    window.history.pushState({}, '', newUrl.toString());
  };

  return (
    <ErrorBoundary>
      <div className="app">
        {!showObservatory && (
          <>
            <header className="app-header">
              <h1>NOVELI.SH</h1>
              <p>AI Native Interactive Storytelling Platform</p>
              <button 
                onClick={toggleMode}
                className="observatory-toggle"
                title="Open V2 Agent Observatory"
              >
                🔭 Observatory
              </button>
            </header>
            
            <main className="app-main">
              <div className="story-container">
                <StoryInterface initialSeed={seedFromUrl} />
              </div>
            </main>
            
            <footer className="app-footer">
              <p>Built with AI Native Architecture & AWS Well-Architected Framework</p>
            </footer>
          </>
        )}

        {showObservatory && (
          <div className="observatory-container">
            <button 
              onClick={toggleMode}
              className="back-to-story"
              title="Back to Story Interface"
            >
              ← Back to Stories
            </button>
            <ObservatoryDashboard />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;