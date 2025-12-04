import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Piano from './Piano'
import { verifyMelody, getAllUsers, isBlocked, getFailedAttempts } from '../services/Authservice'
import './Loginscreen.css'

const LoginScreen = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [showPiano, setShowPiano] = useState(false)
  const [enteredNotes, setEnteredNotes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [shake, setShake] = useState(false)
  const [existingUsers, setExistingUsers] = useState([])
  
  const requiredNotesCount = 6

  useEffect(() => {
    // Charger les utilisateurs existants
    const users = getAllUsers()
    setExistingUsers(users)
  }, [])

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setMessage('⚠️ Veuillez entrer votre email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('⚠️ Email invalide')
      return
    }

    // Vérifier si l'utilisateur est bloqué
    if (isBlocked(email)) {
      const attempts = getFailedAttempts(email)
      setMessage(`🔒 Compte bloqué après ${attempts} tentatives. Réessayez dans 5 minutes.`)
      return
    }

    setShowPiano(true)
    setMessage('Jouez votre mélodie')
  }

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
    setMessage('Vérification...')

    await new Promise(resolve => setTimeout(resolve, 800))

    const isValid = await verifyMelody(notes, email)

    if (isValid) {
      setMessage('✓ Authentification réussie !')
      await new Promise(resolve => setTimeout(resolve, 1000))
      navigate('/home')
    } else {
      const attempts = getFailedAttempts(email)
      setShake(true)
      
      if (attempts >= 5) {
        setMessage('🔒 Trop de tentatives. Compte bloqué pour 5 minutes.')
      } else {
        setMessage(`✗ Mélodie incorrecte (${attempts}/5 tentatives)`)
      }
      
      setEnteredNotes([])
      setIsLoading(false)
      
      setTimeout(() => {
        setShake(false)
        if (attempts < 5) {
          setMessage('Réessayez')
        }
      }, 2000)
    }
  }

  const resetMelody = () => {
    setEnteredNotes([])
    setMessage('Jouez votre mélodie')
    setIsLoading(false)
  }

  const changeUser = () => {
    setEmail('')
    setShowPiano(false)
    setEnteredNotes([])
    setMessage('')
  }

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header fade-in">
          <div className="icon-music">🎵</div>
          <h1>Authentification Musicale</h1>
          <p>Un système d'authentification unique et sécurisé</p>
        </div>

        {!showPiano ? (
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

            {existingUsers.length > 0 && (
              <div className="existing-users">
                <p className="users-title">Utilisateurs enregistrés :</p>
                <div className="users-list">
                  {existingUsers.map((user) => (
                    <button
                      key={user}
                      className="user-chip"
                      onClick={() => {
                        setEmail(user)
                        setTimeout(() => handleEmailSubmit({ preventDefault: () => {} }), 100)
                      }}
                    >
                      {user}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              className="btn-link"
              onClick={() => navigate('/create-melody')}
            >
              Créer un nouveau compte
            </button>
          </div>
        ) : (
          <>
            <div className="user-badge">
              <span className="user-email">{email}</span>
              <button className="btn-change" onClick={changeUser}>
                Changer
              </button>
            </div>

            <div className="notes-indicator">
              <div className={`notes-row ${shake ? 'shake' : ''}`}>
                {Array.from({ length: requiredNotesCount }).map((_, index) => {
                  const isFilled = index < enteredNotes.length
                  return (
                    <div key={index} className={`note-box ${isFilled ? 'filled' : ''}`}>
                      {isFilled && <span>{enteredNotes[index]}</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="status-message">
              {isLoading ? (
                <div className="loader-small"></div>
              ) : (
                <p className={`message ${message.startsWith('✓') ? 'success' : message.startsWith('✗') || message.startsWith('🔒') ? 'error' : ''}`}>
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
          </>
        )}
      </div>
    </div>
  )
}

export default LoginScreen