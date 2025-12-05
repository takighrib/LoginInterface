import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyMathematicalData } from '../services/Authservice'
import './MathematicalLogin.css'

const MathematicalLogin = ({ email, onSuccess }) => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [mathematicalData, setMathematicalData] = useState({
    equation: '',
    sequence: [],
    result: ''
  })
  const [currentNumber, setCurrentNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('Entrez votre équation')
  const [filledSteps, setFilledSteps] = useState({
    equation: false,
    sequence: false,
    result: false
  })

  const requiredSequenceLength = 5

  const handleEquationSubmit = (e) => {
    e.preventDefault()
    if (!mathematicalData.equation || mathematicalData.equation.length < 3) {
      setMessage('⚠️ Équation trop courte')
      return
    }
    setFilledSteps(prev => ({ ...prev, equation: true }))
    setStep(2)
    setMessage('Entrez votre séquence de nombres')
  }

  const handleAddNumber = () => {
    if (!currentNumber) return
    const num = parseFloat(currentNumber)
    if (isNaN(num)) {
      setMessage('⚠️ Nombre invalide')
      return
    }
    if (mathematicalData.sequence.length >= requiredSequenceLength) return
    setMathematicalData(prev => ({
      ...prev,
      sequence: [...prev.sequence, num]
    }))
    setCurrentNumber('')
    setMessage(`${mathematicalData.sequence.length + 1}/${requiredSequenceLength}`)
  }

  const handleRemoveNumber = (index) => {
    setMathematicalData(prev => ({
      ...prev,
      sequence: prev.sequence.filter((_, i) => i !== index)
    }))
  }

  const handleSequenceSubmit = (e) => {
    e.preventDefault()
    if (mathematicalData.sequence.length !== requiredSequenceLength) {
      setMessage(`⚠️ ${requiredSequenceLength} nombres requis`)
      return
    }
    setFilledSteps(prev => ({ ...prev, sequence: true }))
    setStep(3)
    setMessage('Entrez votre résultat final')
  }

  const handleResultSubmit = async (e) => {
    e.preventDefault()
    if (!mathematicalData.result) {
      setMessage('⚠️ Résultat requis')
      return
    }
    const result = parseFloat(mathematicalData.result)
    if (isNaN(result)) {
      setMessage('⚠️ Résultat invalide')
      return
    }

    setIsLoading(true)
    setMessage('Vérification...')

    await new Promise(resolve => setTimeout(resolve, 1000))
    const isValid = await verifyMathematicalData(mathematicalData, email)

    if (isValid) {
      setMessage('✓ Authentification réussie !')
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSuccess()
    } else {
      setMessage('✗ Données mathématiques incorrectes')
      setMathematicalData({ equation: '', sequence: [], result: '' })
      setFilledSteps({ equation: false, sequence: false, result: false })
      setStep(1)
      setIsLoading(false)
      setTimeout(() => setMessage('Entrez votre équation'), 2000)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    else navigate('/login')
  }

  const stepIndicators = [
    { key: 'equation', icon: '📐', label: 'Équation' },
    { key: 'sequence', icon: '🔢', label: 'Séquence' },
    { key: 'result', icon: '✅', label: 'Résultat' }
  ]

  return (
    <div className="mathematical-login-screen">
      <div className="mathematical-login-container">
        <div className="mathematical-login-header">
          <button className="btn-back" onClick={handleBack}>← Retour</button>
          <div className="mathematical-icon-large">🔢</div>
          <h1>Authentification Mathématique</h1>
          <p>Entrez vos données mathématiques</p>
        </div>

        <div className="user-badge">
          <span className="user-email">{email}</span>
        </div>

        {/* Indicateurs de progression */}
        <div className="math-indicator">
          {stepIndicators.map((indicator, index) => (
            <div 
              key={indicator.key}
              className={`math-box ${
                step > index + 1 ? 'completed' : step === index + 1 ? 'active' : ''
              }`}
            >
              <span>{indicator.icon}</span>
              <small>{indicator.label}</small>
            </div>
          ))}
        </div>

        {/* Message de status */}
        <div className="status-message">
          {isLoading ? <div className="loader-small"></div> :
            <p className={`message ${
              message.startsWith('✓') ? 'success' :
              message.startsWith('✗') || message.startsWith('⚠️') ? 'error' : ''
            }`}>
              {message}
            </p>
          }
        </div>

        {/* ÉTAPE 1: ÉQUATION */}
        {step === 1 && (
          <div className="math-step fade-in">
            <div className="step-info">
              <h3>📐 Votre équation</h3>
              <p>Entrez l'équation que vous avez créée</p>
            </div>

            <form onSubmit={handleEquationSubmit}>
              <div className="form-group">
                <input
                  type="password"
                  value={mathematicalData.equation}
                  onChange={(e) => setMathematicalData(prev => ({ ...prev, equation: e.target.value }))}
                  placeholder="Ex: 2x+5=15"
                  className="form-input math-input"
                  autoFocus
                  disabled={isLoading}
                  required
                  style={{ color: 'black' }}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={isLoading}>Suivant →</button>
            </form>
          </div>
        )}

        {/* ÉTAPE 2: SÉQUENCE */}
        {step === 2 && (
          <div className="math-step fade-in">
            <div className="step-info">
              <h3>🔢 Votre séquence</h3>
              <p>Entrez vos {requiredSequenceLength} nombres dans l'ordre</p>
            </div>

           <div className="sequence-display">
  {mathematicalData.sequence.map((num, index) => (
    <div key={index} className="sequence-number">
      {/* Remplacer le nombre par des étoiles */}
      <span>{'*'.repeat(num.toString().length)}</span>
      <button 
        type="button" 
        onClick={() => handleRemoveNumber(index)} 
        className="btn-remove" 
        disabled={isLoading}
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
                <div className="number-input-group">
                  <input
                    type="password"
                    value={currentNumber}
                    onChange={(e) => setCurrentNumber(e.target.value)}
                    onKeyPress={(e) => { if(e.key==='Enter'){ e.preventDefault(); handleAddNumber(); } }}
                    placeholder="Nombre"
                    className="form-input"
                    disabled={isLoading || mathematicalData.sequence.length >= requiredSequenceLength}
                    style={{ color: 'black' }}
                  />
                  <button type="button" onClick={handleAddNumber} className="btn-add" disabled={isLoading || mathematicalData.sequence.length >= requiredSequenceLength}>+</button>
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={isLoading || mathematicalData.sequence.length !== requiredSequenceLength}>Suivant →</button>
            </form>
          </div>
        )}

        {/* ÉTAPE 3: RÉSULTAT */}
        {step === 3 && (
          <div className="math-step fade-in">
            <div className="step-info">
              <h3>✅ Résultat final</h3>
              <p>Entrez votre nombre résultat</p>
            </div>

            <div className="recap-mini">
  <div className="recap-item">
    <small>Équation:</small>
    <strong>{'*'.repeat(mathematicalData.equation.length)}</strong>
  </div>
  <div className="recap-item">
    <small>Séquence:</small>
    <strong>
      {mathematicalData.sequence.map(num => '*'.repeat(num.toString().length)).join(', ')}
    </strong>
  </div>
</div>

            <form onSubmit={handleResultSubmit}>
              <div className="form-group">
                <input
                  type="password"
                  value={mathematicalData.result}
                  onChange={(e) => setMathematicalData(prev => ({ ...prev, result: e.target.value }))}
                  placeholder="Votre résultat"
                  className="form-input result-input"
                  autoFocus
                  disabled={isLoading}
                  required
                  style={{ color: 'black' }}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Vérification...' : 'Se connecter'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default MathematicalLogin
