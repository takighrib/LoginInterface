import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

import SplashScreen from './components/SplashScreen'
import LoginScreen from './components/LoginScreen'
import CreateMelodyScreen from './components/CreateMelodyScreen'
import CreateScientificAccount from './components/CreateScientificAccount'
import CreateMathematicalAccount from './components/CreateMathematicalAccount'
import HomeScreen from './components/HomeScreen'
import PianoScreen from './components/Piano'
import ScientificLogin from './components/ScientificLogin'
import MathematicalLogin from './components/MathematicalLogin'
import OTPLogin from './components/otp'
import ProfileSelection from './components/ProfileSelection'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // Splash screen pendant 2 secondes
    
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <SplashScreen />
  }

  return (
    <Router>
      <Routes>
        {/* Redirection par défaut vers la sélection de profil */}
        <Route path="/" element={<Navigate to="/profile-selection" replace />} />

        {/* Sélection de profil (première page) */}
        <Route path="/profile-selection" element={<ProfileSelection />} />

        {/* Page de connexion */}
        <Route path="/login" element={<LoginScreen />} />

        {/* Création de comptes selon le profil */}
        <Route path="/create-melody" element={<CreateMelodyScreen />} />
        <Route path="/create-scientific" element={<CreateScientificAccount />} />
        <Route path="/create-mathematical" element={<CreateMathematicalAccount />} />

        {/* Page d'accueil après connexion */}
        <Route path="/home" element={<HomeScreen />} />

        {/* Composants de login spécifiques */}
        <Route path="/piano" element={<PianoScreen />} />
        <Route path="/scientific-login" element={<ScientificLogin />} />
        <Route path="/mathematical-login" element={<MathematicalLogin />} />
        <Route path="/otp" element={<OTPLogin />} />

        {/* Redirection 404 */}
        <Route path="*" element={<Navigate to="/profile-selection" replace />} />
      </Routes>
    </Router>
  )
}

export default App