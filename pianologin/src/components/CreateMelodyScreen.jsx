import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Piano from './Piano'
import { createMelody, hasMelody } from '../services/Authservice'
import './CreateMelodyScreen.css'

const CreateMelodyScreen = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [showPiano, setShowPiano] = useState(false)
  const [firstMelody, setFirstMelody] = useState([])
  const [confirmMelody, setConfirmMelody] = useState([])
  const [isFirstStep, setIsFirstStep] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  const requiredNotesCount = 6

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')
    
    if (!email.trim()) {
      setErrorMessage('⚠️ Veuillez entrer votre email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErrorMessage('⚠️ Email invalide')
      return
    }

    // Vérifier si cet email a déjà une mélodie
    if (hasMelody(email)) {
      setErrorMessage('⚠️ Cet email a déjà une mélodie enregistrée. Allez sur la page de connexion.')
      return
    }

    setShowPiano(true)
    setMessage('')
  }

  const handleNotePlayed = (note) => {
    if (isFirstStep) {
      if (firstMelody.length < requiredNotesCount) {
        const newMelody = [...firstMelody, note]
        setFirstMelody(newMelody)
        setMessage(`Note ${newMelody.length}/${requiredNotesCount}`)
        
        if (newMelody.length === requiredNotesCount) {
          setMessage('Parfait ! Maintenant rejouez votre mélodie pour confirmer')
          setTimeout(() => {
            setIsFirstStep(false)
            setMessage('')
          }, 1500)
        }
      }
    } else {
      if (confirmMelody.length < requiredNotesCount) {
        const newMelody = [...confirmMelody, note]
        setConfirmMelody(newMelody)
        setMessage(`Confirmation ${newMelody.length}/${requiredNotesCount}`)
        
        if (newMelody.length === requiredNotesCount) {
          verifyAndSaveMelody(newMelody)
        }
      }
    }
  }

  const verifyAndSaveMelody = async (melody) => {
    setIsLoading(true)
    setMessage('Vérification...')

    await new Promise(resolve => setTimeout(resolve, 800))

    if (firstMelody.join() === melody.join()) {
      try {
        await createMelody(firstMelody, email)
        setMessage('✓ Mélodie créée avec succès !')
        await new Promise(resolve => setTimeout(resolve, 1500))
        navigate('/login')
      } catch (error) {
        setMessage('✗ Erreur lors de la création')
        setIsLoading(false)
        setTimeout(() => {
          setMessage('')
          setConfirmMelody([])
        }, 2000)
      }
    } else {
      setMessage('✗ Les mélodies ne correspondent pas')
      setConfirmMelody([])
      setIsLoading(false)
      
      setTimeout(() => {
        setMessage('')
      }, 2000)
    }
  }

  const resetMelody = () => {
    setFirstMelody([])
    setConfirmMelody([])
    setIsFirstStep(true)
    setMessage('')
    setIsLoading(false)
  }

  const changeEmail = () => {
    setEmail('')
    setShowPiano(false)
    setFirstMelody([])
    setConfirmMelody([])
    setIsFirstStep(true)
    setMessage('')
    setErrorMessage('')
  }

  const currentMelody = isFirstStep ? firstMelody : confirmMelody

  return (
    <div className="create-melody-screen">
      <div className="create-container">
        <div className="create-header">
          <button className="btn-back" onClick={() => navigate('/login')}>
            ← Retour
          </button>
          <h1>Créer un compte</h1>
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
                <p className="field-hint">Votre email sera associé à votre mélodie</p>
              </div>
              
              {errorMessage && (
                <p className="form-message error">{errorMessage}</p>
              )}
              
              <button type="submit" className="btn-primary">
                Continuer
              </button>
            </form>

            <button 
              className="btn-link"
              onClick={() => navigate('/login')}
            >
              Déjà un compte ? Se connecter
            </button>
          </div>
        ) : (
          <>
            <div className="user-badge scale-in">
              <span className="user-email">{email}</span>
              <button className="btn-change" onClick={changeEmail}>
                Changer
              </button>
            </div>

            {/* Indicateurs d'étapes */}
            <div className="steps-indicator">
              <div className={`step ${isFirstStep ? 'active' : 'completed'}`}>
                <div className="step-circle">
                  {isFirstStep ? '1' : '✓'}
                </div>
                <span>Créer</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${!isFirstStep ? 'active' : ''}`}>
                <div className="step-circle">2</div>
                <span>Confirmer</span>
              </div>
            </div>

            <div className="step-title fade-in">
              <h2>{isFirstStep ? 'Créez votre mélodie' : 'Confirmez votre mélodie'}</h2>
              <p>{isFirstStep ? `Choisissez une séquence de ${requiredNotesCount} notes` : 'Rejouez la même mélodie'}</p>
            </div>

            <div className="notes-indicator">
              <div className="notes-row">
                {Array.from({ length: requiredNotesCount }).map((_, index) => {
                  const isFilled = index < currentMelody.length
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
                <p className={`message ${message.startsWith('✓') ? 'success' : message.startsWith('✗') ? 'error' : ''}`}>
                  {message}
                </p>
              )}
            </div>

            <Piano 
              onNotePlayed={handleNotePlayed}
              enabled={!isLoading && currentMelody.length < requiredNotesCount}
            />

            {currentMelody.length > 0 && !isLoading && (
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

export default CreateMelodyScreen