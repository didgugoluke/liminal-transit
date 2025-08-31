import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { StoryInterface } from './components/story/StoryInterface';
import './App.css';

function App() {
  // Extract seed from URL params if present
  const urlParams = new URLSearchParams(window.location.search);
  const seedFromUrl = urlParams.get('seed') || undefined;

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <h1>NOVELI.SH</h1>
          <p>AI Native Interactive Storytelling Platform</p>
        </header>
        
        <main className="app-main">
          <div className="story-container">
            <StoryInterface initialSeed={seedFromUrl} />
          </div>
        </main>
        
        <footer className="app-footer">
          <p>Built with AI Native Architecture & AWS Well-Architected Framework</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;