let displayArray = []; 
let nArrayElements = 5;
let algoNum = 0;
let selectedElementIndices = [];

let audioCtx = null;
const audioMult = 500;
const audioDurationSec = .3;

function playNote(freq) {
  if(audioCtx == null) {
    audioCtx = new (AudioContext || 
                    window.AudioContext || 
                    window.webkitAudioContext)();
  }
  const nDecimals = 2;
  const osc = new OscillatorNode(audioCtx, {
    frequency: Number(freq).toFixed(nDecimals),
  });
  osc.start();
  osc.stop(audioCtx.currentTime+audioDurationSec);

  const gainVal = 1;
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = gainVal;
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+audioDurationSec);
  osc.connect(gainNode);

  const volumeGainNode = audioCtx.createGain();
  volumeGainNode.gain.value = Number(volume).toFixed(nDecimals);
  gainNode.connect(volumeGainNode);

  volumeGainNode.connect(audioCtx.destination);
}

let mainP5 = new p5(p => {
  const view = document.getElementById('array-view');
  
  p.backgroundColor = 'lightblue';
  p.elementColor = 'darkgrey';
  p.selectedElementColor = 'green';
  p.heightMult = 150;
  p.elementSpacing = 1;
  p.elementWidth = 10;
  p.lastFrameSelectedElements = [];

  p.setup = () => {
    const canvasLen = view.clientWidth,
          canvasHeight = view.clientHeight;
    
    const cnv = p.createCanvas(canvasLen, canvasHeight);
    cnv.parent('array-view');

    for(let i = 1; i <= nArrayElements; i++) displayArray.push(i);
  }
  
  p.draw = () => {
    p.background(p.backgroundColor);
    p.drawElements();
  }
  
  p.windowResized = () => {
    const canvasLen = view.clientWidth,
          canvasHeight = view.clientHeight;
    p.resizeCanvas(canvasLen, canvasHeight);
  }

  p.drawElements = () => {
    p.push();
    p.translate(0, view.clientHeight);;
    p.scale(1, -1);

    p.rectMode(p.LEFT);
    p.strokeWeight(1);

    for(let i = 0; i < nArrayElements; i++) {
      let selected = false;
      for(let j = 0; j < selectedElementIndices.length; j++) {
        if(i == selectedElementIndices[j]) {
          p.fill(p.selectedElementColor);
          p.lastFrameSelectedElements.push(i);
          selected = true;
          break;
        }
      }
      if(!selected) p.fill(p.elementColor);
      p.rect((p.elementSpacing+p.elementWidth)*i, 0, p.elementWidth, p.heightMult*Math.log(displayArray[i]+20));
    }

    p.pop();
  }
}, 'array-view');