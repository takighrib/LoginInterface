import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Piano from './Piano'
import ScientificLogin from './ScientificLogin'
import OTPLogin from './otp'
import { verifyMelody, getAllUsers, isBlocked, getFailedAttempts, getUserProfile } from '../services/Authservice'
import './Loginscreen.css'

const LoginScreen = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [showPiano, setShowPiano] = useState(false)
  const [showScientific, setShowScientific] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [enteredNotes, setEnteredNotes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [existingUsers, setExistingUsers] = useState([])

  const requiredNotesCount = 6

  useEffect(() => {
    const users = getAllUsers()
    setExistingUsers(users)
  }, [])

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return setMessage('⚠️ Veuillez entrer votre email')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return setMessage('⚠️ Email invalide')

    if (isBlocked(email)) {
      const attempts = getFailedAttempts(email)
      return setMessage(`🔒 Compte bloqué après ${attempts} tentatives. Réessayez dans 5 minutes.`)
    }

    // Vérifier le type de profil de l'utilisateur
    const userProfile = getUserProfile(email)
    
    if (!userProfile) {
      return setMessage('⚠️ Aucun compte trouvé avec cet email')
    }

    if (userProfile.profileType === 'musical') {
      setShowPiano(true)
      setMessage('Jouez votre mélodie')
    } else if (userProfile.profileType === 'scientific') {
      setShowScientific(true)
    }
  }

  const handleOTPSuccess = () => {
    navigate('/home')
  }

  const changeUser = () => {
    setEmail('')
    setShowPiano(false)
    setShowScientific(false)
    setEnteredNotes([])
    setMessage('')
    setShowOTP(false)
  }

  // ... reste du code pour Piano (comme avant)

  return (
    <div className="login-screen">
      <div className="login-container">
        {!showPiano && !showScientific && !showOTP ? (
          <>
            <div className="login-header fade-in">
              <div className="icon-music">🎯</div>
              <h1>Authentification NIRD</h1>
              <p>Connexion personnalisée et sécurisée</p>
            </div>

            <div className="email-form fade-in">
              <form onSubmit={handleEmailSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Adresse email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="email-input"
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Continuer
                </button>
              </form>

              <button 
                className="btn-link"
                onClick={() => navigate('/profile-selection')}
              >
                Créer un compte
              </button>
            </div>
          </>
        ) : showOTP ? (
          <OTPLogin email={email} onSuccess={handleOTPSuccess} />
        ) : showScientific ? (
          <ScientificLogin email={email} onSuccess={() => setShowOTP(true)} />
        ) : (
          // Code Piano (comme avant)
          <></>
        )}
      </div>
    </div>
  )
}

export default LoginScreen