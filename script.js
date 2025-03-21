const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const activeTouches = {};

const notes = {
  "C3": 130.81,
  "C#3": 138.59,
  "D3": 146.83,
  "D#3": 155.56,
  "E3": 164.81,
  "F3": 174.61,
  "F#3": 185.00,
  "G3": 196.00,
  "G#3": 207.65,
  "A3": 220.00,
  "A#3": 233.08,
  "B3": 246.94,
  "C4": 261.63,
  "C#4": 277.18,
  "D4": 293.66,
  "D#4": 311.13,
  "E4": 329.63,
  "F4": 349.23,
  "F#4": 369.99,
  "G4": 392.00,
  "G#4": 415.30,
  "A4": 440.00,
  "A#4": 466.16,
  "B4": 493.88,
  "C5": 523.25,
  "C#5": 554.37,
  "D5": 587.33,
  "D#5": 622.25,
  "E5": 659.25,
  "F5": 698.46,
  "F#5": 739.99,
  "G5": 783.99,
  "G#5": 830.61,
  "A5": 880.00,
  "A#5": 932.33,
  "B5": 987.77,
  "C6": 1046.50
};

// Bass-Drum-1.wav

// Store active audio buffers for each note
const activeBuffers = {};

// Load a single piano sample (e.g., C4)
let pianoSample;
fetch("Bass-Drum-1.wav") // Replace with the path to your piano sample
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  .then(audioBuffer => {
    pianoSample = audioBuffer;
  });

// Function to play a note
function playNote(frequency) {
    const selectedInstrument = instrumentSelector.value;
    const sample = instruments[selectedInstrument];
    if (!sample) return; // Ensure the sample is loaded
  
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
  
    source.buffer = sample;
    source.playbackRate.value = frequency / 261.63; // Pitch-shift to the desired note (C4 = 261.63Hz)
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
  
    source.start();
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
  
    // Store the source so we can stop it later
    activeBuffers[frequency] = { source, gainNode };
  }
  
  // Function to stop a note
  function stopNote(frequency) {
    if (activeBuffers[frequency]) {
      const { source, gainNode } = activeBuffers[frequency];
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05); // Fade out
      source.stop(audioContext.currentTime + 0.02); // Stop after fade out
      delete activeBuffers[frequency]; // Remove from active buffers
    }
  }

// Function to get the key under a touch
function getKeyUnderTouch(touch) {
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    return document.elementFromPoint(touchX, touchY);
  }
  
  // Add touch event listeners to keys
  document.addEventListener("touchstart", (event) => {
    event.preventDefault();
    Array.from(event.changedTouches).forEach(touch => {
      const key = getKeyUnderTouch(touch);
      if (key && key.classList.contains("key")) {
        const note = key.getAttribute("data-note");
        playNote(notes[note]);
        key.classList.add("active"); // Add visual feedback
        activeTouches[touch.identifier] = { key, note };
      }
    });
  });
  
  document.addEventListener("touchmove", (event) => {
    event.preventDefault();
    Array.from(event.changedTouches).forEach(touch => {
      const activeTouch = activeTouches[touch.identifier];
      if (activeTouch) {
        const newKey = getKeyUnderTouch(touch);
        if (newKey && newKey.classList.contains("key") && newKey !== activeTouch.key) {
          // Stop the old note
          stopNote(notes[activeTouch.note]);
          activeTouch.key.classList.remove("active");
  
          // Start the new note
          const newNote = newKey.getAttribute("data-note");
          playNote(notes[newNote]);
          newKey.classList.add("active");
          activeTouches[touch.identifier] = { key: newKey, note: newNote };
        }
      }
    });
  });
  
  document.addEventListener("touchend", (event) => {
    event.preventDefault();
    Array.from(event.changedTouches).forEach(touch => {
      const activeTouch = activeTouches[touch.identifier];
      if (activeTouch) {
        stopNote(notes[activeTouch.note]);
        activeTouch.key.classList.remove("active");
        delete activeTouches[touch.identifier];
      }
    });
  });

  // Disable right-click on piano keys
document.querySelectorAll(".key").forEach(key => {
    key.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  });

  // Disable right-click context menu
document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });