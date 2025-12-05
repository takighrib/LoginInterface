import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyScientificData, isBlocked, getFailedAttempts } from '../services/Authservice'
import './ScientificLogin.css'

const ScientificLogin = ({ email, onSuccess }) => {
  const navigate = useNavigate()
  const [scientificData, setScientificData] = useState({
    bloodType: '',
    birthDate: '',
    height: '',
    weight: '',
    chemicalFormula: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('Entrez vos données scientifiques')
  const [filledFields, setFilledFields] = useState({
    bloodType: false,
    birthDate: false,
    height: false,
    weight: false,
    chemicalFormula: false
  })

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setScientificData(prev => ({
      ...prev,
      [name]: value
    }))

    // Mettre à jour les champs remplis
    setFilledFields(prev => ({
      ...prev,
      [name]: !!value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isBlocked(email)) {
      const attempts = getFailedAttempts(email)
      setMessage(`🔒 Compte bloqué après ${attempts} tentatives. Réessayez dans 5 minutes.`)
      return
    }

    // Validation
    if (!scientificData.bloodType || !scientificData.birthDate || 
        !scientificData.height || !scientificData.weight || 
        !scientificData.chemicalFormula) {
      setMessage('⚠️ Veuillez remplir tous les champs')
      return
    }

    setIsLoading(true)
    setMessage('Vérification...')

    await new Promise(resolve => setTimeout(resolve, 1000))

    const isValid = verifyScientificData(scientificData, email)

    if (isValid) {
      setMessage('✓ Authentification réussie !')
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSuccess() // Rediriger vers OTP ou Home
    } else {
      const attempts = getFailedAttempts(email)
      setMessage(attempts >= 5
        ? '🔒 Trop de tentatives. Compte bloqué pour 5 minutes.'
        : `✗ Données incorrectes (${attempts}/5 tentatives)`)
      
      // Réinitialiser le formulaire
      setScientificData({
        bloodType: '',
        birthDate: '',
        height: '',
        weight: '',
        chemicalFormula: ''
      })
      setFilledFields({
        bloodType: false,
        birthDate: false,
        height: false,
        weight: false,
        chemicalFormula: false
      })
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setScientificData({
      bloodType: '',
      birthDate: '',
      height: '',
      weight: '',
      chemicalFormula: ''
    })
    setFilledFields({
      bloodType: false,
      birthDate: false,
      height: false,
      weight: false,
      chemicalFormula: false
    })
    setMessage('Entrez vos données scientifiques')
    setIsLoading(false)
  }

  const dataFields = [
    { key: 'bloodType', icon: '🩸' },
    { key: 'birthDate', icon: '📅' },
    { key: 'height', icon: '📏' },
    { key: 'weight', icon: '⚖️' },
    { key: 'chemicalFormula', icon: '⚗️' }
  ]

  return (
    <div className="scientific-login-screen">
      <div className="scientific-login-container">
        <div className="scientific-login-header">
          <div className="scientific-icon-large">🧬</div>
          <h1>Authentification Scientifique</h1>
          <p>Entrez vos données biologiques</p>
        </div>

        <div className="user-badge">
          <span className="user-email">{email}</span>
        </div>

        <div className="info-box">
          <div className="info-box-icon">ℹ️</div>
          <div className="info-box-text">
            Remplissez tous les champs avec les données que vous avez enregistrées lors de la création de votre compte.
          </div>
        </div>

        {/* Indicateurs de données remplies */}
        <div className="data-indicator">
          {dataFields.map(field => (
            <div 
              key={field.key} 
              className={`data-box ${filledFields[field.key] ? 'filled' : ''}`}
            >
              <span>{field.icon}</span>
            </div>
          ))}
        </div>

        {/* Message de status */}
        <div className="status-message">
          {isLoading ? (
            <div className="loader-small"></div>
          ) : (
            <p className={`message ${message.startsWith('✓') ? 'success' : message.startsWith('✗') || message.startsWith('🔒') ? 'error' : ''}`}>
              {message}
            </p>
          )}
        </div>

        {/* Formulaire scientifique */}
        <div className="scientific-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="bloodType">
                Groupe sanguin <span className="required">*</span>
              </label>
              <select
                id="bloodType"
                name="bloodType"
                value={scientificData.bloodType}
                onChange={handleInputChange}
                className="form-select"
                disabled={isLoading}
                required
              >
                <option value="">Sélectionnez</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="birthDate">
                Date de naissance <span className="required">*</span>
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={scientificData.birthDate}
                onChange={handleInputChange}
                className="form-input"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="height">
                  Taille (cm) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={scientificData.height}
                  onChange={handleInputChange}
                  placeholder="175"
                  min="50"
                  max="250"
                  className="form-input"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="weight">
                  Poids (kg) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={scientificData.weight}
                  onChange={handleInputChange}
                  placeholder="70"
                  min="20"
                  max="300"
                  className="form-input"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="chemicalFormula">
                Formule chimique <span className="required">*</span>
              </label>
              <input
                type="text"
                id="chemicalFormula"
                name="chemicalFormula"
                value={scientificData.chemicalFormula}
                onChange={handleInputChange}
                placeholder="H2O, CO2, NaCl..."
                className="form-input"
                disabled={isLoading}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Vérification...' : 'Se connecter'}
            </button>
          </form>

          {!isLoading && Object.values(filledFields).some(v => v) && (
            <button className="btn-reset" onClick={resetForm}>
              🔄 Réinitialiser
            </button>
          )}

          <button 
            className="btn-link"
            onClick={() => navigate('/login')}
          >
            Retour à la page de connexion
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScientificLogin