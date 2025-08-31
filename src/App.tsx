import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="app-header">
        <h1>NOVELI.SH</h1>
        <p>AI Native Interactive Storytelling Platform</p>
      </header>
      
      <main className="app-main">
        <section className="liminal-space">
          <h2>Welcome to the Liminal Transit</h2>
          <p>You find yourself in a space between destinations...</p>
          
          <div className="debug-counter">
            <button onClick={() => setCount((count) => count + 1)}>
              Count: {count}
            </button>
          </div>
        </section>
      </main>
      
      <footer className="app-footer">
        <p>Built with AI Native Architecture & AWS Well-Architected Framework</p>
      </footer>
    </div>
  )
}

export default App