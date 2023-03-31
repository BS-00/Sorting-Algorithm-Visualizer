function selectIndex(ms, index) {
    if(!started) {
        throw new Error('Sorting while stopped');
    }

    selectedElementIndices.push(index);
    if(displayArray[index] != null) {
        playNote(audioMult*(displayArray[index]/(nArrayElements)));
    }

    return new Promise(resolve => {
        setTimeout(() => {
            selectedElementIndices.splice(selectedElementIndices.indexOf(index), 1);
            resolve();
        }, ms);
    });
}

class Sorter {
    static delayMillis = 30;
    static async selectionSort(arr) {
        for(let i = arr.length-1; i >= 0; i--) {
            Sorter.#swap(arr, await Sorter.#getLargestI(arr, i+1), i);
            await selectIndex(Sorter.delayMillis, i);
        }
    }

    static async bubbleSort(arr) {
        let size = arr.length;
        while(size > 0) {
            size = await Sorter.#bubble(arr, size);
        }
    }

    static async insertionSort(arr) {
        for(let i = 1; i < arr.length; i++) {
            let prev_i = i-1;
            if(arr[prev_i] < arr[i]) continue; //items are in order
            
            //find where to insert it
            let insert_i = 0;
            for(let j = prev_i; j >= 0; j--) {
                if(arr[j] > arr[i]) insert_i = j;
                await this.selectionSort(Sorter.delayMillis);
            }
            //move items over
            let tmp = arr[i];
            await Sorter.#moveRight(arr, insert_i, i);
            //insert
            arr[insert_i] = tmp;
            await selectIndex(Sorter.delayMillis, i);
        }
    }

    static async heapSort(arr) {
        for(let i = arr.length-1; i > 1; i--) {
            await Sorter.#heapify(arr, i+1);
            Sorter.#swap(arr, 0, i);
        }
        //check the front two elements
        if((arr.length > 1) && (arr[0] > arr[1])) {
            Sorter.#swap(arr, 0, 1);
        }
    }

    static async mergeSort(arr, start_i=0, end_i=arr.length) {
        if (end_i-start_i < 2) return;

        let mid = Math.floor((end_i+start_i)/2);
        await Sorter.mergeSort(arr, start_i, mid);
        await Sorter.mergeSort(arr, mid, end_i);
        await Sorter.#merge(arr, start_i, mid, end_i);
    }

    static async quickSort(arr, start_i=0, end=arr.length) {
        let size = (end-start_i);
        if((size == 2) && (arr[start_i] > arr[end-1])) {
            Sorter.#swap(arr, start_i, end-1);
        }
        if(size <= 2) return;

        let pivot_i;
        await Sorter.#partition(arr, start_i, end).then(res => {
            pivot_i = res;
        });
        await selectIndex(Sorter.delayMillis, pivot_i);
        await Sorter.quickSort(arr, start_i, pivot_i);
        await Sorter.quickSort(arr, pivot_i+1, end);
    }

    //private helper methods
    static #swap(arr, i1, i2) {
        let tmp = arr[i1];
        arr[i1] = arr[i2];
        arr[i2] = tmp;
    }

    static async #bubble(arr, size) {
        let swap_pos = -1;
        for(let i = 0; i < size-1; i++) {
            if(arr[i] > arr[i+1]) {
                await selectIndex(Sorter.delayMillis, i);
                Sorter.#swap(arr, i, i+1);
                swap_pos = i+1;
            }
        }
        return swap_pos;
    }

    static async #moveRight(arr, start_i, end_i) {
        for(let i = end_i; i > start_i; i--) {
            arr[i] = arr[i-1];
            await selectIndex(Sorter.delayMillis, i);
        }
    }

    static async #getLargestI(arr, size) {
        let largest_i = 0;
        for(let i = 1; i < size; i++) {
            if(arr[i] > arr[largest_i]) largest_i = i;
            await selectIndex(Sorter.delayMillis, i);
        }
        return largest_i;
    }

    //for heap sort
    static #get_left_child_i(pos) { return (2*pos)+1; }
    static #get_right_child_i(pos) { return 2*(pos)+2; }
    //static #get_parent_i(pos) { return (pos-1)/2; }

    static async #heapify(arr, heap_size) {
        let left_i, right_i, biggest_i, parent_i;

        for(let i = heap_size; i >= 0; i--) {
            //while the node has children, check if the children need to be swapped with the parent
            parent_i = i;
            while(Sorter.#get_left_child_i(parent_i) < heap_size)  {
                left_i = Sorter.#get_left_child_i(parent_i);
                right_i = Sorter.#get_right_child_i(parent_i);
                biggest_i = parent_i;

                await Promise.all([selectIndex(Sorter.delayMillis, parent_i),
                                   selectIndex(Sorter.delayMillis, left_i),
                                   selectIndex(Sorter.delayMillis, right_i)]);
                
                //if the child is bigger then the parent, swap them
                if(arr[left_i] > arr[biggest_i]) {
                    biggest_i = left_i;
                }
                if((right_i < heap_size) && (arr[right_i] > arr[biggest_i])) {
                    biggest_i = right_i;
                }
                if(biggest_i != parent_i) {
                    Sorter.#swap(arr, biggest_i, parent_i);
                    parent_i = biggest_i; //check to make sure the sub heap is still a heap (biggest_i is now the smaller item)
                } else break; //item is bigger then sub items so found where it is supposed to go
            }
        }
    }

    static async #merge(arr, start1_i, start2_i, end_i) {
        let ret = [];
        let container1_i = start1_i, container2_i = start2_i;

        for(let i = 0; i < (end_i-start1_i); i++) {
            await Promise.all([selectIndex(Sorter.delayMillis, container1_i),
                               selectIndex(Sorter.delayMillis, container2_i)]);
            if((container1_i < start2_i) && (container2_i >= end_i || arr[container1_i] <= arr[container2_i])) {
                ret.push(arr[container1_i]);
                container1_i++;
            } else {
                ret.push(arr[container2_i]);
                container2_i++;
            }
        }
        
        for(let i = 0; i < ret.length; i++) {
            arr[i+start1_i] = ret[i];
            await selectIndex(Sorter.delayMillis, i+start1_i);
        }
    }

    static async #partition(arr, start_i, end) {
        //arr[start_i] is the pivot
        let small_element_i = start_i+1, large_element_i = end-1;
        while (small_element_i < large_element_i) {
            await Promise.all([selectIndex(Sorter.delayMillis, small_element_i),
                               selectIndex(Sorter.delayMillis, large_element_i)]);
            if(arr[small_element_i] > arr[start_i]) {
                //both in wrong spot
                if(arr[large_element_i] < arr[start_i]) {
                    Sorter.#swap(arr, small_element_i, large_element_i);
                    //now both are in the right spot
                    small_element_i++;
                    large_element_i--;
                } else {
                    //large element pointer is in the right spot
                    large_element_i--;
                }
            } else if(arr[large_element_i] < arr[start_i]) {
                //just the large element pointer is in the right spot
                small_element_i++;
            } else {
                //both are in the right spot
                small_element_i++;
                large_element_i--;
            }
        }

        if(arr[large_element_i] > arr[start_i]) {
            await Promise.all([selectIndex(Sorter.delayMillis, start_i),
                               selectIndex(Sorter.delayMillis, large_element_i-1)]);
            Sorter.#swap(arr, start_i, large_element_i-1);
            return large_element_i-1;
        }

        //swap the pivot with the last element less than the pivot
        await Promise.all([selectIndex(Sorter.delayMillis, start_i),
                          selectIndex(Sorter.delayMillis, large_element_i)]);
        Sorter.#swap(arr, start_i, large_element_i);
        return large_element_i;
    }
}