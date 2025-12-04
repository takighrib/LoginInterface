import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logout } from '../services/Authservice'
import './Homescreen.css'

const HomeScreen = () => {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState('')

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      navigate('/login')
    } else {
      setCurrentUser(user)
    }
  }, [navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="home-screen">
      <div className="home-container fade-in">
        <div className="success-icon scale-in">
          ✓
        </div>

        <h1 className="home-title">Bienvenue !</h1>
        <p className="home-subtitle">Authentification réussie</p>

        {currentUser && (
          <div className="user-info">
            <span className="user-label">Connecté en tant que :</span>
            <span className="user-value">{currentUser}</span>
          </div>
        )}

        <div className="info-card">
          <div className="info-icon">🎵</div>
          <h3>Votre mélodie est active</h3>
          <p>Vous pouvez maintenant accéder à toutes les fonctionnalités</p>
        </div>

        <div className="actions">
          <button className="btn-primary" onClick={() => alert('Fonctionnalité à venir')}>
            Accéder au dashboard
          </button>
          <button className="btn-secondary" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h4>Sécurisé</h4>
            <p>Chaque utilisateur a un hash unique (email + mélodie)</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎹</div>
            <h4>Intuitif</h4>
            <p>Une mélodie est plus facile à retenir qu'un mot de passe</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h4>Rapide</h4>
            <p>Authentifiez-vous en quelques secondes</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeScreen