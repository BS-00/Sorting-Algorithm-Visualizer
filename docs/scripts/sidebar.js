let volume;
let settingsSideBarP5 = new p5(p => {
    const sideBar = document.getElementById('right-sidebar');
    const sidebarAlgoDrop = document.getElementById('selected-algorithm-drop');
    const timeStatText = document.getElementById('time-stat-text');

    const sidebarBtn = sideBar.querySelector('.sidebarbtn');
    const randomizeBtn = document.getElementById('randomize-btn');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');

    const nElementsSlider = document.getElementById('n-elements');
    const volumeSlider = document.getElementById('volume');
    const delaySlider = document.getElementById('delay');

    p.algoTimeMillis = 0;
    p.maxVol = .15; //from 0 to 1

    p.setup = () => {
        p.createCanvas(0, 0);
        sidebarAlgoDrop.addEventListener('change', p.updateAlgo);

        sidebarBtn.addEventListener('click', toggleRightSidebar); 
        randomizeBtn.addEventListener('click', p.shuffleArray);
        startBtn.addEventListener('click', p.start);
        stopBtn.addEventListener('click', p.stop);

        nElementsSlider.addEventListener('input', p.updateNElements);
        volumeSlider.addEventListener('input', p.updateVolume);
        delaySlider.addEventListener('input', p.updateDelay);

        nArrayElements = nElementsSlider.value;
        volume = volumeSlider.value*p.maxVol; //find a cleaner way to do this
        Sorter.delayMillis = parseInt(delaySlider.value, 10);
    }

    p.updateVolume = (event) => {
        const frac = parseFloat(event.target.value, 10)/parseFloat(event.target.max, 10);
        volume = Math.pow(frac, 2)*p.maxVol;
    }

    p.updateDelay = (event) => {
        Sorter.delayMillis = parseInt(event.target.value, 10);
    }

    p.updateAlgo = (event) => {
        if(started) return;
        algoNum = Number(event.target.value);
    }

    p.updateNElements = (event) => {
        if(started) return;
        displayArray = [];
        nArrayElements = event.target.value;
        for(let i = 1; i <= nArrayElements; i++) displayArray.push(i);
    }

    p.shuffleArray = () => {
        if(started) return;
        for (let i = displayArray.length-1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = displayArray[i];
            displayArray[i] = displayArray[j];
            displayArray[j] = temp;
        }
    }

    p.start = () => {
        if(started) return;
        started = true;
        p.algoTimeMillis = 0;
        p.updateTimeStatText();
        p.sort();
    }
    p.stop = () => { started = false; }

    p.sort = async () => {
        const intervalMillis = 1;
        const timer = setInterval(() => {
            p.algoTimeMillis+=intervalMillis;
            p.updateTimeStatText();
        }, intervalMillis);

        try {
            switch(algoNum) {
                case 0: await Sorter.selectionSort(displayArray); break;
                case 1: await Sorter.bubbleSort(displayArray); break;
                case 2: await Sorter.insertionSort(displayArray); break;
                case 3: await Sorter.heapSort(displayArray); break;
                case 4: await Sorter.mergeSort(displayArray); break;
                case 5: await Sorter.quickSort(displayArray); break;
                case 6: await Sorter.timSort(displayArray); break;
                case 7: await Sorter.combSort(displayArray); break;
                case 8: await Sorter.brickSort(displayArray); break;
                case 9: await Sorter.gnomeSort(displayArray); break;
                case 10: await Sorter.shellSort(displayArray); break;
                case 11: await Sorter.cocktailSort(displayArray); break;
                case 12: await Sorter.introSort(displayArray); break;
                default: break;
            }
        } catch (e) {
            //stopped
        }
        started = false;
        selectedElementIndex = -1;
        clearInterval(timer);
    }

    p.updateTimeStatText = () => {
        const nDecimals = 2;
        timeStatText.textContent = "Time: " + (p.algoTimeMillis/100).toFixed(nDecimals).toString() + " s";
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