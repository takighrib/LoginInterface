const noteSettings = {
  'C':  { freq: [261.63, 329.63, 392.00,261.63,500], type: 'sine',    attack: 0.01, sustain: 0.2 }, // Piano "la la la"
  'C#': { freq: [500, 500, 500],          type: 'square',  attack: 0.005, sustain: 0.3 }, // Guitare "be be be"
  'D':  { freq: [150, 150, 150,150, 150, 150],          type: 'triangle',attack: 0.1, sustain: 0.4 }, // Tambour "boom boom"
  'D#': { freq: [523.25, 587.33],         type: 'sawtooth',attack: 0.02, sustain: 0.25 }, // Xylophone "ting ting"
  'E':  { freq: [659.25,659.25,659.25],                 type: 'triangle',attack: 0.01, sustain: 0.2 }, // Cloche "ding"
  'F':  { freq: [349.23, 392.00,349.23],         type: 'sine',    attack: 0.01, sustain: 0.3 }, // Synthé "ta ta"
  'G':  { freq: [392, 392, 440,392, 392, 440,392, 392, 440],          type: 'triangle',attack: 0.02, sustain: 0.2 }, // Shaker "sh sh"
  'G#': { freq: [523.25, 587.33, 659.25], type: 'sine',    attack: 0.005, sustain: 0.3 }, // Harpe "ha ha"
  'A':  { freq: [880],                     type: 'triangle',attack: 0.01, sustain: 0.2 }, // Flûte "pi"
  'A#': { freq: [698.46, 739.99],         type: 'square',  attack: 0.01, sustain: 0.25 }, // Bongo "bo bo"
  'B':  { freq: [987.77, 1046.50],        type: 'sawtooth',attack: 0.01, sustain: 0.2 }, // Triangle "ting ting"
}

export const playNote = async (note, duration = 0.3) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const settings = noteSettings[note]

  if (!settings) {
    console.error(`Note inconnue: ${note}`)
    return
  }

  const gainNode = audioContext.createGain()
  gainNode.connect(audioContext.destination)

  for (let i = 0; i < settings.freq.length; i++) {
    const oscillator = audioContext.createOscillator()
    oscillator.connect(gainNode)
    oscillator.type = settings.type
    oscillator.frequency.setValueAtTime(settings.freq[i], audioContext.currentTime)

    const now = audioContext.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.3, now + settings.attack)
    gainNode.gain.linearRampToValueAtTime(0, now + duration / settings.freq.length)

    oscillator.start(now)
    oscillator.stop(now + duration / settings.freq.length)

    await new Promise(resolve => setTimeout(resolve, (duration / settings.freq.length) * 1000))
  }
}
