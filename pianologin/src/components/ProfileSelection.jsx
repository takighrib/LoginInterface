import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProfileSelection.css'

const ProfileSelection = () => {
  const navigate = useNavigate()
  const [selectedProfile, setSelectedProfile] = useState(null)

  const profiles = [
    {
      id: 'musical',
      icon: '🎵',
      title: 'Musical',
      description: 'Authentification par séquence mélodique au piano',
      features: ['6 notes à mémoriser', 'Mémorisation auditive', 'Interface piano interactif'],
      difficulty: 'Moyenne',
      color: 'rgba(74, 144, 226, 0.2)',
      route: '/create-melody'
    },
    {
      id: 'scientific',
      icon: '🧬',
      title: 'Scientifique',
      description: 'Authentification par données biologiques et formule chimique',
      features: ['Groupe sanguin', 'Données physiques', 'Formule chimique préférée'],
      difficulty: 'Facile',
      color: 'rgba(76, 175, 80, 0.2)',
      route: '/create-scientific'
    },
    {
      id: 'mathematical',
      icon: '🔢',
      title: 'Mathématique',
      description: 'Authentification par équations et suites logiques',
      features: ['Équation personnelle', 'Suite numérique', 'Logique mathématique'],
      difficulty: 'Difficile',
      color: 'rgba(255, 152, 0, 0.2)',
      route: '/create-mathematical'
    },
    {
      id: 'visual',
      icon: '🎨',
      title: 'Visuel',
      description: 'Authentification par pattern de couleurs et formes',
      features: ['Séquence de couleurs', 'Motif géométrique', 'Mémoire visuelle'],
      difficulty: 'Moyenne',
      color: 'rgba(156, 39, 176, 0.2)',
      comingSoon: true
    }
  ]

  const handleSelectProfile = (profileId) => {
    setSelectedProfile(profileId)
  }

  const handleContinue = () => {
    if (!selectedProfile) return
    
    const profile = profiles.find(p => p.id === selectedProfile)
    if (!profile) return
    
    // Stocker le profil sélectionné dans sessionStorage
    sessionStorage.setItem('selectedProfile', selectedProfile)
    
    // Rediriger vers la page de création appropriée
    navigate(profile.route)
  }

  const handleGoToLogin = () => {
    navigate('/login')
  }

  return (
    <div className="profile-selection-screen">
      <div className="profile-container">
        <div className="profile-header">
          <div className="header-content">
            <div className="icon-main">🎯</div>
            <h1>Bienvenue sur NIRD Auth</h1>
            <p>Choisissez votre type d'authentification personnalisée</p>
          </div>
        </div>

        <div className="profiles-grid">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`profile-card ${selectedProfile === profile.id ? 'selected' : ''} ${profile.comingSoon ? 'coming-soon' : ''}`}
              onClick={() => !profile.comingSoon && handleSelectProfile(profile.id)}
              style={{ '--profile-color': profile.color }}
            >
              {profile.comingSoon && (
                <div className="coming-soon-badge">Bientôt disponible</div>
              )}
              
              <div className="profile-icon">{profile.icon}</div>
              <h3 className="profile-title">{profile.title}</h3>
              <p className="profile-description">{profile.description}</p>
              
              <div className="profile-features">
                {profile.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-bullet">•</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="profile-footer">
                <span className={`difficulty difficulty-${profile.difficulty.toLowerCase()}`}>
                  Difficulté : {profile.difficulty}
                </span>
              </div>

              {selectedProfile === profile.id && (
                <div className="selected-indicator">
                  <span>✓</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="nird-info">
          <h3>🌱 Approche NIRD</h3>
          <div className="nird-pillars-small">
            <div className="pillar-small">
              <span>🤝</span>
              <p>Inclusif</p>
            </div>
            <div className="pillar-small">
              <span>🔒</span>
              <p>Responsable</p>
            </div>
            <div className="pillar-small">
              <span>🌍</span>
              <p>Durable</p>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          {selectedProfile && (
            <button 
              className="btn-continue"
              onClick={handleContinue}
            >
              Créer un compte {profiles.find(p => p.id === selectedProfile)?.title}
            </button>
          )}
          
          <button 
            className="btn-login-link"
            onClick={handleGoToLogin}
          >
            Déjà un compte ? Se connecter
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileSelection