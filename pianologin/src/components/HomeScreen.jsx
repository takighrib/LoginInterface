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
        

        <h1 className="home-title">Bienvenue !</h1>
        <p className="home-subtitle">
          Authentification réussie avec votre mélodie musicale 🎵
        </p>

        

        {/* Carte info mélodie */}
        <div className="info-card">
          <div className="info-icon">🎶</div>
          <h3>Votre mélodie est active</h3>
          <p>
            Chaque note de votre mélodie est unique et sécurisée. N'oubliez pas :
            votre mélodie est votre mot de passe !
          </p>
        </div>
        

        {/* Section NIRD */}
        <div className="nird-section">
          <h2>🌱 Démarche NIRD</h2>
          <p>
            Inspiré par le numérique Inclusif, Responsable et Durable, votre compte 
            utilise des méthodes ludiques et pédagogiques pour sécuriser votre accès.
          </p>
          <div className="nird-pillars">
            <div className="pillar">
              <div className="pillar-icon">🤝</div>
              <h4>Inclusif</h4>
              <p>Un mot de passe mélodique accessible à tous, même pour les débutants.</p>
            </div>
            <div className="pillar">
              <div className="pillar-icon">🔒</div>
              <h4>Responsable</h4>
              <p>Votre mélodie est unique, protégée et respectueuse de vos données.</p>
            </div>
            <div className="pillar">
              <div className="pillar-icon">🌍</div>
              <h4>Durable</h4>
              <p>Une approche ludique et éco-responsable pour apprendre et sécuriser le numérique.</p>
            </div>
          </div>
        </div>

        <div className="actions">
          <button className="btn-primary" onClick={() => alert('Fonctionnalité à venir')}>
            Accéder au dashboard
          </button>
              <button className="btn-logout" onClick={handleLogout}>
  Se déconnecter
</button>
          
          
        </div>
    
        

        
      </div>
    </div>
  )
}

export default HomeScreen
