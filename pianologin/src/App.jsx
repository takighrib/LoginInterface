import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import SplashScreen from './components/SplashScreen'
import LoginScreen from './components/LoginScreen'
import CreateMelodyScreen from './components/CreateMelodyScreen'
import HomeScreen from './components/HomeScreen'
import { hasMelody } from './services/Authservice'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasStoredMelody, setHasStoredMelody] = useState(false)

  useEffect(() => {
    const checkMelody = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Splash screen
      const exists = hasMelody()
      setHasStoredMelody(exists)
      setIsLoading(false)
    }
    checkMelody()
  }, [])

  if (isLoading) {
    return <SplashScreen />
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            hasStoredMelody ? 
              <Navigate to="/login" replace /> : 
              <Navigate to="/create-melody" replace />
          } 
        />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/create-melody" element={<CreateMelodyScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App