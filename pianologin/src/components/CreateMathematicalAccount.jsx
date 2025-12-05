import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMathematicalAccount } from '../services/Authservice'
import './CreateMathematicalAccount.css'

const CreateMathematicalAccount = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [step, setStep] = useState(1) // 1: équation, 2: séquence, 3: résultat
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Données mathématiques
  const [mathematicalData, setMathematicalData] = useState({
    equation: '',
    sequence: [],
    result: ''
  })

  // Pour la séquence
  const [currentNumber, setCurrentNumber] = useState('')
  const requiredSequenceLength = 5

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

    setShowForm(true)
  }

  const handleEquationSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!mathematicalData.equation || mathematicalData.equation.length < 3) {
      setErrorMessage('⚠️ Équation trop courte (minimum 3 caractères)')
      return
    }

    // Vérifier que l'équation contient au moins un opérateur
    const hasOperator = /[+\-*/^=]/.test(mathematicalData.equation)
    if (!hasOperator) {
      setErrorMessage('⚠️ L\'équation doit contenir au moins un opérateur (+, -, *, /, ^, =)')
      return
    }

    setStep(2)
  }

  const handleAddNumber = () => {
    if (!currentNumber) return

    const num = parseFloat(currentNumber)
    if (isNaN(num)) {
      setErrorMessage('⚠️ Veuillez entrer un nombre valide')
      return
    }

    if (mathematicalData.sequence.length >= requiredSequenceLength) {
      setErrorMessage(`⚠️ Maximum ${requiredSequenceLength} nombres`)
      return
    }

    setMathematicalData(prev => ({
      ...prev,
      sequence: [...prev.sequence, num]
    }))
    setCurrentNumber('')
    setErrorMessage('')
  }

  const handleRemoveNumber = (index) => {
    setMathematicalData(prev => ({
      ...prev,
      sequence: prev.sequence.filter((_, i) => i !== index)
    }))
  }

  const handleSequenceSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (mathematicalData.sequence.length !== requiredSequenceLength) {
      setErrorMessage(`⚠️ Vous devez entrer exactement ${requiredSequenceLength} nombres`)
      return
    }

    setStep(3)
  }

  const handleResultSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!mathematicalData.result) {
      setErrorMessage('⚠️ Veuillez entrer un résultat')
      return
    }

    const result = parseFloat(mathematicalData.result)
    if (isNaN(result)) {
      setErrorMessage('⚠️ Le résultat doit être un nombre valide')
      return
    }

    setIsLoading(true)
    setSuccessMessage('Création du compte...')

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await createMathematicalAccount(email, mathematicalData)
      
      setSuccessMessage('✓ Compte mathématique créé avec succès !')
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      navigate('/login')
    } catch (error) {
      setErrorMessage('✗ Erreur lors de la création du compte')
      setIsLoading(false)
    }
  }

  const changeEmail = () => {
    setEmail('')
    setShowForm(false)
    setStep(1)
    setMathematicalData({
      equation: '',
      sequence: [],
      result: ''
    })
    setCurrentNumber('')
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      setErrorMessage('')
    } else {
      navigate('/profile-selection')
    }
  }

  return (
    <div className="create-mathematical-screen">
      <div className="mathematical-container">
        <div className="mathematical-header">
          <button className="btn-back" onClick={handleBack}>
            ← Retour
          </button>
          <div className="mathematical-icon">🔢</div>
          <h1>Profil Mathématique</h1>
          <p>Créez votre authentification par formules</p>
        </div>

        {!showForm ? (
          <div className="email-form">
            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <label htmlFor="email">
                  Adresse email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="form-input"
                  autoFocus
                />
                <p className="field-hint">Votre email sera associé à vos données mathématiques</p>
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
          <div className="mathematical-form">
            <div className="user-badge">
              <span className="user-email">{email}</span>
              <button className="btn-change" onClick={changeEmail}>
                Changer
              </button>
            </div>

            {/* Indicateur d'étapes */}
            <div className="steps-indicator">
              <div className={`step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
                <div className="step-circle">{step > 1 ? '✓' : '1'}</div>
                <span>Équation</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
                <div className="step-circle">{step > 2 ? '✓' : '2'}</div>
                <span>Séquence</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${step === 3 ? 'active' : ''}`}>
                <div className="step-circle">3</div>
                <span>Résultat</span>
              </div>
            </div>

            {/* ÉTAPE 1: ÉQUATION */}
            {step === 1 && (
              <div className="step-content fade-in">
                <div className="instructions">
                  <h3>📐 Étape 1 : Votre équation personnelle</h3>
                  <ul>
                    <li>Créez une équation mathématique simple</li>
                    <li>Elle servira de clé d'authentification</li>
                    <li>Exemples : "2x+5=15", "a²+b²=c²", "E=mc²"</li>
                    <li>Mémorisez-la bien !</li>
                  </ul>
                </div>

                <form onSubmit={handleEquationSubmit}>
                  <div className="form-group">
                    <label htmlFor="equation">
                      Votre équation <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="equation"
                      value={mathematicalData.equation}
                      onChange={(e) => setMathematicalData(prev => ({
                        ...prev,
                        equation: e.target.value
                      }))}
                      placeholder="Ex: 2x+5=15"
                      className="form-input math-input"
                      autoFocus
                      required
                    />
                    <p className="field-hint">
                      Utilisez des lettres, chiffres et opérateurs (+, -, *, /, ^, =)
                    </p>
                  </div>

                  {errorMessage && (
                    <p className="form-message error">{errorMessage}</p>
                  )}

                  <button type="submit" className="btn-primary">
                    Continuer →
                  </button>
                </form>
              </div>
            )}

            {/* ÉTAPE 2: SÉQUENCE */}
            {step === 2 && (
              <div className="step-content fade-in">
                <div className="instructions">
                  <h3>🔢 Étape 2 : Votre suite numérique</h3>
                  <ul>
                    <li>Créez une séquence de {requiredSequenceLength} nombres</li>
                    <li>Peut être une suite logique ou des nombres aléatoires</li>
                    <li>Exemples : 2, 4, 6, 8, 10 ou 7, 13, 42, 99, 3</li>
                    <li>Ordre important !</li>
                  </ul>
                </div>

                <div className="sequence-display">
                  {mathematicalData.sequence.map((num, index) => (
                    <div key={index} className="sequence-number">
                      <span>{num}</span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveNumber(index)}
                        className="btn-remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {mathematicalData.sequence.length < requiredSequenceLength && (
                    <div className="sequence-empty">
                      {mathematicalData.sequence.length}/{requiredSequenceLength}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSequenceSubmit}>
                  <div className="form-group">
                    <label htmlFor="number">
                      Ajouter un nombre
                    </label>
                    <div className="number-input-group">
                      <input
                        type="text"
                        id="number"
                        value={currentNumber}
                        onChange={(e) => setCurrentNumber(e.target.value)}
                        placeholder="Entrez un nombre"
                        className="form-input"
                        disabled={mathematicalData.sequence.length >= requiredSequenceLength}
                      />
                      <button 
                        type="button"
                        onClick={handleAddNumber}
                        className="btn-add"
                        disabled={mathematicalData.sequence.length >= requiredSequenceLength}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <p className="form-message error">{errorMessage}</p>
                  )}

                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={mathematicalData.sequence.length !== requiredSequenceLength}
                  >
                    Continuer →
                  </button>
                </form>
              </div>
            )}

            {/* ÉTAPE 3: RÉSULTAT */}
            {step === 3 && (
              <div className="step-content fade-in">
                <div className="instructions">
                  <h3>✅ Étape 3 : Résultat final</h3>
                  <ul>
                    <li>Entrez un nombre qui représente votre "résultat"</li>
                    <li>Peut être la solution de votre équation</li>
                    <li>Ou simplement un nombre significatif pour vous</li>
                    <li>Ce sera la dernière clé de votre authentification</li>
                  </ul>
                </div>

                <div className="recap-box">
                  <h4>Récapitulatif</h4>
                  <div className="recap-item">
                    <span className="recap-label">Équation :</span>
                    <span className="recap-value">{mathematicalData.equation}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Séquence :</span>
                    <span className="recap-value">{mathematicalData.sequence.join(', ')}</span>
                  </div>
                </div>

                <form onSubmit={handleResultSubmit}>
                  <div className="form-group">
                    <label htmlFor="result">
                      Résultat final <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="result"
                      value={mathematicalData.result}
                      onChange={(e) => setMathematicalData(prev => ({
                        ...prev,
                        result: e.target.value
                      }))}
                      placeholder="Ex: 42"
                      className="form-input result-input"
                      autoFocus
                      required
                    />
                  </div>

                  {errorMessage && (
                    <p className="form-message error">{errorMessage}</p>
                  )}

                  {successMessage && (
                    <p className="form-message success">{successMessage}</p>
                  )}

                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Création en cours...' : 'Créer mon compte mathématique'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateMathematicalAccount