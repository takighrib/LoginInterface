import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createScientificAccount, hasMelody } from '../services/Authservice'
import './CreateScientificAccount.css'

const CreateScientificAccount = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Données scientifiques
  const [scientificData, setScientificData] = useState({
    bloodType: '',
    birthDate: '',
    height: '',
    weight: '',
    chemicalFormula: ''
  })

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

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

    if (hasMelody(email)) {
      setErrorMessage('⚠️ Cet email a déjà un compte. Allez sur la page de connexion.')
      return
    }

    setShowForm(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setScientificData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleScientificSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    // Validation
    if (!scientificData.bloodType) {
      setErrorMessage('⚠️ Veuillez sélectionner votre groupe sanguin')
      return
    }

    if (!scientificData.birthDate) {
      setErrorMessage('⚠️ Veuillez entrer votre date de naissance')
      return
    }

    if (!scientificData.height || scientificData.height < 50 || scientificData.height > 250) {
      setErrorMessage('⚠️ Taille invalide (50-250 cm)')
      return
    }

    if (!scientificData.weight || scientificData.weight < 20 || scientificData.weight > 300) {
      setErrorMessage('⚠️ Poids invalide (20-300 kg)')
      return
    }

    if (!scientificData.chemicalFormula || scientificData.chemicalFormula.length < 2) {
      setErrorMessage('⚠️ Veuillez entrer une formule chimique valide')
      return
    }

    setIsLoading(true)
    setSuccessMessage('Création du compte...')

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await createScientificAccount(email, scientificData)
      
      setSuccessMessage('✓ Compte créé avec succès !')
      
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
    setScientificData({
      bloodType: '',
      birthDate: '',
      height: '',
      weight: '',
      chemicalFormula: ''
    })
    setErrorMessage('')
    setSuccessMessage('')
  }

  return (
    <div className="create-scientific-screen">
      <div className="scientific-container">
        <div className="scientific-header">
          <button className="btn-back" onClick={() => navigate('/profile-selection')}>
            ← Retour
          </button>
          <div className="scientific-icon">🧬</div>
          <h1>Profil Scientifique</h1>
          <p>Créez votre authentification biologique</p>
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
                <p className="field-hint">Votre email sera associé à vos données scientifiques</p>
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
          <div className="scientific-form">
            <div className="user-badge">
              <span className="user-email">{email}</span>
              <button className="btn-change" onClick={changeEmail}>
                Changer
              </button>
            </div>

            <div className="instructions">
              <h3>📋 Instructions</h3>
              <ul>
                <li>Remplissez vos données biologiques personnelles</li>
                <li>Ces informations serviront de mot de passe</li>
                <li>Mémorisez-les bien pour vos prochaines connexions</li>
                <li>Choisissez une formule chimique simple (ex: H2O, CO2)</li>
              </ul>
            </div>

            <form onSubmit={handleScientificSubmit}>
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
                  required
                >
                  <option value="">Sélectionnez votre groupe</option>
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
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="chemicalFormula">
                  Formule chimique préférée <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="chemicalFormula"
                  name="chemicalFormula"
                  value={scientificData.chemicalFormula}
                  onChange={handleInputChange}
                  placeholder="H2O, CO2, NaCl..."
                  className="form-input"
                  required
                />
                <p className="field-hint">Exemple : H2O (eau), CO2 (dioxyde de carbone)</p>
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
                {isLoading ? 'Création en cours...' : 'Créer mon compte scientifique'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateScientificAccount