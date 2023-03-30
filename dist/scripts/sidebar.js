let volume;

let settingsSideBarP5 = new p5(p => {
    const sideBar = document.getElementById('right-sidebar');
    const sidebarBtn = sideBar.querySelector('.sidebarbtn');
    const sidebarAlgoDrop = document.getElementById('selected-algorithm-drop');
    const nElementsSlider = document.getElementById('n-elements');
    const randomizeBtn = document.getElementById('randomize-btn');
    const startBtn = document.getElementById('start-btn');
    const timeStatText = document.getElementById('time-stat-text');
    const volumeSlider = document.getElementById('volume');
    p.started = false;
    p.algoTimeMillis = 0;

    p.setup = () => {
        p.createCanvas(0, 0);
        sidebarBtn.addEventListener('click', toggleRightSidebar); 
        sidebarAlgoDrop.addEventListener('change', p.updateAlgo);
        nElementsSlider.addEventListener('input', p.updateNElements);
        randomizeBtn.addEventListener('click', p.shuffleArray);
        startBtn.addEventListener('click', p.start);
        volumeSlider.addEventListener('input', p.updateVolume);

        volume = volumeSlider.value;
    }

    p.updateVolume = (event) => {
        const frac = event.target.value / event.target.max;
        volume = Math.pow(frac, 2);
    }

    p.updateAlgo = (event) => {
        if(p.started) return;
        algoNum = Number(event.target.value);
    }

    p.updateNElements = (event) => {
        if(p.started) return;
        displayArray = [];
        nArrayElements = event.target.value;
        for(let i = 1; i <= nArrayElements; i++) displayArray.push(i);
    }

    p.shuffleArray = () => {
        if(p.started) return;
        for (let i = displayArray.length-1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = displayArray[i];
            displayArray[i] = displayArray[j];
            displayArray[j] = temp;
        }
    }

    p.start = () => {
        if(p.started) return;
        p.started = true;
        p.algoTimeMillis = 0;
        p.updateTimeStatText();
        p.sort();
    }

    p.sort = async () => {
        const intervalMillis = 10;
        const timer = setInterval(() => {
            p.algoTimeMillis+=intervalMillis;
            p.updateTimeStatText();
        }, intervalMillis);

        switch(algoNum) {
          case 0: await Sorter.selectionSort(displayArray); break;
          case 1: await Sorter.bubbleSort(displayArray); break;
          case 2: await Sorter.insertionSort(displayArray); break;
          case 3: await Sorter.heapSort(displayArray); break;
          case 4: await Sorter.mergeSort(displayArray); break;
          case 5: await Sorter.quickSort(displayArray); break;
          default: break;
        }
        p.started = false;
        selectedElementIndex = -1;
        clearInterval(timer);
    }

    p.updateTimeStatText = () => {
        const nDecimals = 2;
        timeStatText.textContent = "Time: " + (p.algoTimeMillis*.001).toFixed(nDecimals).toString() + " s";
    }
}, 'right-sidebar');

//Callback functions for sidebar functionality
function toggleRightSidebar() {
    const sidebar = document.getElementById('right-sidebar');
    const sidebarContent = sidebar.querySelector('.sidebar-content');
    const contentSize = window.getComputedStyle(sidebarContent).width;

    if(window.getComputedStyle(sidebar).right < '0') {
        sidebar.style.right = '0';
    } else {
        sidebar.style.right = '-'+contentSize.toString();
    }
}