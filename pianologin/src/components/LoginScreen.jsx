import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Piano from './Piano'
import ScientificLogin from './ScientificLogin'
import MathematicalLogin from './MathematicalLogin'
import OTPLogin from './otp'
import { verifyMelody, getAllUsers, isBlocked, getFailedAttempts, getUserProfile } from '../services/Authservice'
import './Loginscreen.css'

const LoginScreen = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [showPiano, setShowPiano] = useState(false)
  const [showScientific, setShowScientific] = useState(false)
  const [showMathematical, setShowMathematical] = useState(false)
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

  // ===============================
  // Soumission de l'email
  // ===============================
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    if (!email.trim()) return setMessage('⚠️ Veuillez entrer votre email')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return setMessage('⚠️ Email invalide')

    if (isBlocked(email)) {
      const attempts = getFailedAttempts(email)
      return setMessage(`🔒 Compte bloqué après ${attempts} tentatives. Réessayez dans 5 minutes.`)
    }

    setIsLoading(true)
    setMessage('Vérification du compte...')

    try {
      const userProfile = await getUserProfile(email)

      if (!userProfile) {
        setMessage('⚠️ Aucun compte trouvé avec cet email')
        setIsLoading(false)
        return
      }

      // Rediriger vers le bon type d'authentification
      switch (userProfile.profileType) {
        case 'musical':
          setShowPiano(true)
          setMessage('🎵 Jouez votre mélodie')
          break
        case 'scientific':
          setShowScientific(true)
          setMessage('📊 Entrez vos données scientifiques')
          break
        case 'mathematical':
          setShowMathematical(true)
          setMessage('➗ Entrez vos données mathématiques')
          break
        default:
          setMessage('⚠️ Type de profil inconnu')
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Erreur lors de la vérification du profil:', error)
      setMessage('⚠️ Erreur lors de la vérification du compte')
      setIsLoading(false)
    }
  }

  // ===============================
  // Gestion du succès OTP
  // ===============================
  const handleOTPSuccess = () => {
      localStorage.setItem("nird_current_user", JSON.stringify({ email }));

    navigate('/home')
  }

  // ===============================
  // Changer d'utilisateur
  // ===============================
  const changeUser = () => {
    setEmail('')
    setShowPiano(false)
    setShowScientific(false)
    setShowMathematical(false)
    setEnteredNotes([])
    setMessage('')
    setShowOTP(false)
    setIsLoading(false)
  }

  // ===============================
  // Gestion du piano (profil musical)
  // ===============================
  const handleNotePlayed = (note) => {
    if (enteredNotes.length < requiredNotesCount) {
      const newNotes = [...enteredNotes, note]
      setEnteredNotes(newNotes)
      setMessage(`Note ${newNotes.length}/${requiredNotesCount}`)

      if (newNotes.length === requiredNotesCount) {
        verifyMelodySequence(newNotes)
      }
    }
  }

  const verifyMelodySequence = async (notes) => {
    setIsLoading(true)
    setMessage('🔍 Vérification...')

    await new Promise(resolve => setTimeout(resolve, 800))

    const isValid = await verifyMelody(notes, email)

    if (isValid) {
      setMessage('✓ Mélodie correcte ! Envoi OTP...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      setShowPiano(false)
      setShowOTP(true)
    } else {
      const attempts = getFailedAttempts(email)
      setMessage(
        isBlocked(email)
          ? '🔒 Trop de tentatives. Compte bloqué pour 5 minutes.'
          : `✗ Mélodie incorrecte (${attempts}/5 tentatives)`
      )
      setEnteredNotes([])
      setTimeout(() => {
        setMessage('🎵 Réessayez votre mélodie')
      }, 2000)
    }

    setIsLoading(false)
  }

  const resetMelody = () => {
    setEnteredNotes([])
    setMessage('🎵 Rejouez votre mélodie')
    setIsLoading(false)
  }

  // ===============================
  // Rendu du composant
  // ===============================
  return (
    <div className="login-screen">
      <div className="login-container">
        {!showPiano && !showScientific && !showMathematical && !showOTP ? (
          // Écran 1: saisie email
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
                    disabled={isLoading}
                  />
                </div>

                {message && (
                  <p
                    className={`form-message ${
                      message.startsWith('✓') ? 'success' :
                      message.startsWith('✗') || message.startsWith('⚠️') || message.startsWith('🔒') ? 'error' :
                      ''
                    }`}
                  >
                    {message}
                  </p>
                )}

                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? 'Vérification...' : 'Continuer'}
                </button>
              </form>

              <button 
                className="btn-link"
                onClick={() => navigate('/profile-selection')}
                disabled={isLoading}
              >
                Créer un compte
              </button>
            </div>
          </>
        ) : showOTP ? (
          <OTPLogin email={email} onSuccess={handleOTPSuccess} />
        ) : showScientific ? (
          <ScientificLogin email={email} onSuccess={() => setShowOTP(true)} />
        ) : showMathematical ? (
          <MathematicalLogin email={email} onSuccess={() => setShowOTP(true)} />
        ) : (
          // Écran piano
          <>
            <div className="user-badge scale-in">
              <span className="user-email">{email}</span>
              <button className="btn-change" onClick={changeUser}>
                Changer
              </button>
            </div>

            <div className="step-title fade-in">
              <h2>Jouez votre mélodie</h2>
              <p>Reproduisez la séquence de {requiredNotesCount} notes</p>
            </div>

            {/* Indicateur de progression */}
            <div className="notes-indicator">
              <div className="notes-row">
                {Array.from({ length: requiredNotesCount }).map((_, index) => {
                  const isFilled = index < enteredNotes.length
                  return (
                    <div key={index} className={`note-box ${isFilled ? 'filled' : ''}`}>
                      {isFilled && <span>★</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="status-message">
              {isLoading ? (
                <div className="loader-small"></div>
              ) : (
                <p className={`message ${
                  message.startsWith('✓') ? 'success' : 
                  message.startsWith('✗') || message.startsWith('🔒') ? 'error' : 
                  ''
                }`}>
                  {message}
                </p>
              )}
            </div>

            <Piano 
              onNotePlayed={handleNotePlayed}
              enabled={!isLoading && enteredNotes.length < requiredNotesCount}
            />

            {enteredNotes.length > 0 && !isLoading && (
              <button className="btn-reset scale-in" onClick={resetMelody}>
                🔄 Recommencer
              </button>
            )}

            <button className="btn-link" onClick={changeUser}>
              Changer d'utilisateur
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default LoginScreen
