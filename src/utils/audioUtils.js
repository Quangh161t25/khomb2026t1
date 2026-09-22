const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function playSuccessSound() {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    // Tiếng Tít trong trẻo
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime); 
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    console.error('Lỗi phát âm thanh', e);
  }
}

export function playErrorSound() {
  try {
    initAudio();
    
    const playBeep = (delay) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sawtooth';
      // Tiếng Bíp trầm chói tai
      osc.frequency.setValueAtTime(250, audioCtx.currentTime + delay);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.15);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + 0.15);
    };

    // 3 tiếng bíp liên tục
    playBeep(0);
    playBeep(0.25);
    playBeep(0.5);

  } catch (e) {
    console.error('Lỗi phát âm thanh', e);
  }
}
