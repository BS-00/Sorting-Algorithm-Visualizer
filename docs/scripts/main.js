let displayArray = []; 
let nArrayElements = 5;
let algoNum = 0;
let selectedElementIndices = [];
let started;

let audioCtx = null;
const audioMult = 450;
const audioDurationSec = .35;

function playNote(freq) {
  if(audioCtx == null) {
    audioCtx = new (AudioContext || 
                    window.AudioContext || 
                    window.webkitAudioContext)();
  }

  const nDecimals = 3;
  const oscNode = audioCtx.createOscillator();
  oscNode.frequency.value = Number(freq).toFixed(nDecimals);
  oscNode.type = "sine";
  oscNode.decay = 0;

  const popTime = .08;
  const gainNode = audioCtx.createGain();
  if  (Number(volume).toFixed(nDecimals) == 0) {
    gainNode.gain.value = 0;
  } else {
    //ramps the volume from essentially 0 to desired and from desired to 0 to reduce popping sound
    //start
    gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(Number(volume).toFixed(nDecimals), audioCtx.currentTime+parseFloat(popTime));
    //end
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+audioDurationSec-parseFloat(popTime));
  }

  const compressor = audioCtx.createDynamicsCompressor();
  oscNode.connect(gainNode).connect(compressor).connect(audioCtx.destination);
  oscNode.start();
  oscNode.stop(audioCtx.currentTime+audioDurationSec);
}

let mainP5 = new p5(p => {
  const view = document.getElementById('array-view');
  
  p.backgroundColor = 'lightblue';
  p.elementColor = 'darkgrey';
  p.selectedElementColor = 'green';
  p.heightMult = view.clientHeight/9;
  p.elementSpacing = 1.1;
  p.elementWidth = 8;
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