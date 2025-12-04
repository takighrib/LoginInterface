import './Splashscreen.css'

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-icon pulse">
          🎵
        </div>
        <h1 className="splash-title fade-in">Music Auth</h1>
        <p className="splash-subtitle fade-in">Authentification par mélodie</p>
        <div className="splash-loader">
          <div className="loader-spinner"></div>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen