let AUDIO_CTX, SCRIPT_NODE, GAIN_NODE, ANALYSER;
let freq = 440;
let VOLUME = 0.1;
let USER_EQUATION = "Math.sin(2 * Math.PI * freq * t)";
const WAVE_COLOR_PICKER = document.getElementById("waveColor");
let WAVE_FUNC = (t, freq) => Math.sin(2 * Math.PI * freq * t);
let IS_BYTEBEAT = false;
let SAMPLE_COUNTER = 0;

const toggleButton = document.getElementById("toggle-button");
const inputWrap = document.getElementById("wrap");

toggleButton.addEventListener("click", () => {
  inputWrap.classList.toggle("hidden");
});

const CANVAS = document.getElementById("oscilloscope");
const CTX = CANVAS.getContext("2d");

document.getElementById("freqSlider").addEventListener("input", (e) => {
  freq = parseFloat(e.target.value);
  document.getElementById("freqValue").textContent = freq;
});

document.getElementById("volSlider").addEventListener("input", (e) => {
  VOLUME = parseFloat(e.target.value);
  document.getElementById("volValue").textContent = VOLUME.toFixed(2);
  if (GAIN_NODE) GAIN_NODE.gain.value = VOLUME;
});

function TOGGLE_MODE() {
  IS_BYTEBEAT = !IS_BYTEBEAT;
  SAMPLE_COUNTER = 0;
  document.getElementById("modeButton").innerText =
  IS_BYTEBEAT ? "Mode: Bytebeat" : "Mode: Float";
}

function RESIZE_CANVAS() {
  const STYLE = getComputedStyle(CANVAS);
  const CSS_WIDTH = parseFloat(STYLE.width);
  const CSS_HEIGHT = parseFloat(STYLE.height);
  const SCALE = window.devicePixelRatio || 1;

  CANVAS.width = CSS_WIDTH * SCALE;
  CANVAS.height = CSS_HEIGHT * SCALE;
  CTX.scale(SCALE, SCALE);
}
RESIZE_CANVAS();

function START_SYNTH() {
  if (!AUDIO_CTX) {
    AUDIO_CTX = new (window.AudioContext || window.webkitAudioContext)();

    GAIN_NODE = AUDIO_CTX.createGain();
    GAIN_NODE.gain.value = VOLUME;

    SCRIPT_NODE = AUDIO_CTX.createScriptProcessor(1024, 0, 1);
    ANALYSER = AUDIO_CTX.createAnalyser();
    ANALYSER.fftSize = 2048;

    SCRIPT_NODE.onaudioprocess = function (AUDIO_PROCESSING_EVENT) {
      const OUTPUT_BUFFER = AUDIO_PROCESSING_EVENT.outputBuffer;
      const OUTPUT_DATA = OUTPUT_BUFFER.getChannelData(0);
      const SAMPLE_RATE = OUTPUT_BUFFER.sampleRate;
      const TIME_START = AUDIO_PROCESSING_EVENT.playbackTime;
      const BYTEBEAT_SAMPLE_RATE = 8000;
      for (let SAMPLE = 0; SAMPLE < OUTPUT_BUFFER.length; SAMPLE++) {
        let T;
        if (IS_BYTEBEAT) {
          T = SAMPLE_COUNTER / BYTEBEAT_SAMPLE_RATE;
        } else {
          T = TIME_START + SAMPLE / SAMPLE_RATE;
        }

        let VALUE = 0;
        try {
          VALUE = WAVE_FUNC(IS_BYTEBEAT ? SAMPLE_COUNTER : T, freq);
          if (IS_BYTEBEAT) {
            VALUE = (VALUE & 255) / 128 - 1;
          }
        } catch (e) {
          VALUE = 0;
        }

        if (IS_BYTEBEAT) {
          const SAMPLES_PER_BYTEBEAT = Math.floor(
            SAMPLE_RATE / BYTEBEAT_SAMPLE_RATE
          );
          if (SAMPLE % SAMPLES_PER_BYTEBEAT === 0) {
            OUTPUT_DATA[SAMPLE] = Math.max(-1, Math.min(1, VALUE));
            SAMPLE_COUNTER++;
          } else {
            OUTPUT_DATA[SAMPLE] = OUTPUT_DATA[SAMPLE - 1] || 0;
          }
        } else {
          OUTPUT_DATA[SAMPLE] = Math.max(-1, Math.min(1, VALUE));
        }
      }
    };

    SCRIPT_NODE.connect(GAIN_NODE);
    GAIN_NODE.connect(ANALYSER);
    ANALYSER.connect(AUDIO_CTX.destination);

    VISUALIZE();
  }

  const EQ_TEXT = document.getElementById("equation").value;
  try {
    WAVE_FUNC = new Function("t", "freq", `return ${EQ_TEXT};`);
  } catch (e) {
    alert("Invalid equation!");
  }
}

function VISUALIZE() {
  const BUFFER_LENGTH = ANALYSER.fftSize;
  const DATA_ARRAY = new Uint8Array(BUFFER_LENGTH);

  function DRAW() {
    requestAnimationFrame(DRAW);

    const WIDTH = CANVAS.width / (window.devicePixelRatio || 1);
    const HEIGHT = CANVAS.height / (window.devicePixelRatio || 1);

    CTX.clearRect(0, 0, WIDTH, HEIGHT);

    if (!ANALYSER) return;

    const BUFFER_LENGTH = ANALYSER.fftSize;
    const DATA_ARRAY = new Uint8Array(BUFFER_LENGTH);
    ANALYSER.getByteTimeDomainData(DATA_ARRAY);

    const PADDING = 50;
    const INNER_HEIGHT = HEIGHT - PADDING * 2;

    CTX.beginPath();
    CTX.strokeStyle = WAVE_COLOR_PICKER.value;
    CTX.lineWidth = 2;

    const SLICE_WIDTH = WIDTH / BUFFER_LENGTH;
    let X = 0;

    for (let I = 0; I < BUFFER_LENGTH; I++) {
      const V = DATA_ARRAY[I] / 128.0;
      const Y = PADDING + INNER_HEIGHT / 2 + (V - 1) * (INNER_HEIGHT / 2);

      if (I === 0) {
        CTX.moveTo(X, Y);
      } else {
        CTX.lineTo(X, Y);
      }

      X += SLICE_WIDTH;
    }

    CTX.stroke();
  }
  DRAW();
}

function LOAD_FROM_URL() {
  const params = new URLSearchParams(window.location.search);
  
  if (params.has('eq')) {
    const equation = decodeURIComponent(params.get('eq'));
    document.getElementById("equation").value = equation;
    USER_EQUATION = equation;
  }
  
  if (params.has('mode')) {
    const mode = params.get('mode');
    if (mode === 'bytebeat') {
      IS_BYTEBEAT = true;
      document.querySelector("button").innerText = "Mode: Bytebeat";
    }
  }
  
  if (params.has('freq')) {
    freq = parseFloat(params.get('freq'));
    document.getElementById("freqSlider").value = freq;
    document.getElementById("freqValue").textContent = freq;
  }
  
  if (params.has('vol')) {
    VOLUME = parseFloat(params.get('vol'));
    document.getElementById("volSlider").value = VOLUME;
    document.getElementById("volValue").textContent = VOLUME.toFixed(2);
  }
  
  if (params.has('color')) {
    const color = '#' + params.get('color');
    WAVE_COLOR_PICKER.value = color;
  }
}

function SAVE_LINK() {
  const equation = document.getElementById("equation").value;
  const mode = IS_BYTEBEAT ? 'bytebeat' : 'float';
  const color = WAVE_COLOR_PICKER.value.substring(1);
  
  const params = new URLSearchParams({
    eq: equation,
    mode: mode,
    freq: freq,
    vol: VOLUME,
    color: color
  });
   
  const url = window.location.origin + window.location.pathname + '?' + params.toString();
  
  navigator.clipboard.writeText(url).then(() => {
    // its empty here
    console.log("copied to clipboard");
  }).catch(() => {
    prompt('Couldnt copy to clipboard, copy this link:', url);
  });
}

function RANDOMIZE_EQ() {
  const vars = ["t"];
  const nums = ["1", "2", "4", "8", "16", "32"];
  const ops = ["+", "-", "*", "^", "&", "|", "<<", ">>"];
  const funcs = ["Math.sin", "Math.cos", "Math.tan"];
  // for later...
}

LOAD_FROM_URL();
window.addEventListener("resize", RESIZE_CANVAS);
