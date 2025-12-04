import { useState } from 'react'
import { playNote } from '../services/Audioservice'
import './Piano.css'

const Piano = ({ onNotePlayed, enabled = true }) => {
  const [pressedKey, setPressedKey] = useState(null)

  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const blackKeys = ['C#', 'D#', null, 'F#', 'G#', 'A#', null]

  const handleNotePress = (note) => {
    if (!enabled || !note) return
    
    setPressedKey(note)
    playNote(note)
    onNotePlayed(note)
    
    setTimeout(() => setPressedKey(null), 200)
  }

  return (
    <div className="piano-container">
      <div className="piano">
        {/* Touches blanches */}
        <div className="white-keys">
          {whiteKeys.map((note) => (
            <button
              key={note}
              className={`key white-key ${pressedKey === note ? 'pressed' : ''} ${!enabled ? 'disabled' : ''}`}
              onMouseDown={() => handleNotePress(note)}
              onTouchStart={(e) => {
                e.preventDefault()
                handleNotePress(note)
              }}
              disabled={!enabled}
            >
              <span className="note-label">{note}</span>
            </button>
          ))}
        </div>

        {/* Touches noires */}
        <div className="black-keys">
          {blackKeys.map((note, index) => (
            <div key={index} className="black-key-spacer">
              {note ? (
                <button
                  className={`key black-key ${pressedKey === note ? 'pressed' : ''} ${!enabled ? 'disabled' : ''}`}
                  onMouseDown={() => handleNotePress(note)}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    handleNotePress(note)
                  }}
                  disabled={!enabled}
                >
                  <span className="note-label">{note.replace('#', '♯')}</span>
                </button>
              ) : (
                <div className="black-key-placeholder"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Piano