// Fréquences des notes (octave 4)
const noteFrequencies = {
  'C': 261.63,
  'C#': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'A': 440.00,
  'A#': 466.16,
  'B': 493.88,
}

/**
 * Joue une note en utilisant l'API Web Audio
 */
export const playNote = (note, duration = 0.3) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const frequency = noteFrequencies[note]
    
    if (!frequency) {
      console.error(`Note inconnue: ${note}`)
      return
    }

    // Oscillateur pour générer le son
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Type de forme d'onde (sine = son doux comme un piano)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
    
    // Envelope ADSR pour un son plus naturel
    const now = audioContext.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01) // Attack
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1)  // Decay
    gainNode.gain.setValueAtTime(0.2, now + duration - 0.1) // Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + duration) // Release
    
    oscillator.start(now)
    oscillator.stop(now + duration)
    
    // Nettoyer après utilisation
    setTimeout(() => {
      oscillator.disconnect()
      gainNode.disconnect()
    }, duration * 1000 + 100)
    
  } catch (error) {
    console.error('Erreur lors de la lecture de la note:', error)
  }
}

/**
 * Joue une mélodie complète
 */
export const playMelody = async (notes, tempo = 500) => {
  for (let i = 0; i < notes.length; i++) {
    playNote(notes[i])
    await new Promise(resolve => setTimeout(resolve, tempo))
  }
}