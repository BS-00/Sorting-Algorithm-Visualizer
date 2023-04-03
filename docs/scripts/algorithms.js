function selectIndex(ms, index) {
    if(!started) {
        throw new Error('Sorting while stopped');
    }

    if(ms == 0) {
        selectedElementIndices.splice(selectedElementIndices.indexOf(index), 1);
        return;
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
    static delayMillis = 25;
    static async selectionSort(arr, start_i=0, end=arr.length) {
        for(let i = end; i > start_i; i--) {
            Sorter.#swap(arr, await Sorter.#getLargestI(arr, start_i, i), i-1);
            await selectIndex(Sorter.delayMillis, i-1);
        }
    }

    static async bubbleSort(arr, start_i=0, end=arr.length) {
        let sorted_i = end;
        while (sorted_i > start_i) {
            let swap_i = start_i;
            let right_i = start_i+1;
            for(; right_i < sorted_i; right_i++) {
                const left_i = right_i-1;
                await Promise.all([selectIndex(Sorter.delayMillis, right_i),
                                   selectIndex(Sorter.delayMillis, left_i)]);
                if (arr[left_i] > arr[right_i]) {
                    Sorter.#swap(arr, left_i, right_i);
                    swap_i = right_i;
                }
            }
            sorted_i = swap_i;
        }
    }

    static async insertionSort(arr, start_i=0, end=arr.length) {
        for(let i = start_i+1; i < end; i++) {
            let insert_i = i-1, right_i = i;
            while(insert_i >= start_i) {
                await Promise.all([selectIndex(Sorter.delayMillis, right_i), 
                                   selectIndex(Sorter.delayMillis, insert_i)]);
                if (arr[insert_i] <= arr[right_i]) break;
                Sorter.#swap(arr, insert_i, right_i);
                right_i = insert_i;
                insert_i--;
            }
        }
    }
    

   static async heapSort(arr, start_i=0, end=arr.length) {
        //build a heap from the array
        for(let heap_i = Math.floor((end-start_i)/2)-1;  heap_i >= start_i; heap_i--) {
            await Sorter.#heapify(arr, heap_i, end);
        }

        //swap the max element with the last element and re-heapify
        for(let heap_end = end; heap_end > start_i; heap_end--) {
            Sorter.#swap(arr, start_i, heap_end-1);
            await Sorter.#heapify(arr, start_i, heap_end-1);
        }
   }

    static async mergeSort(arr, start_i=0, end=arr.length) {
        if ((end-start_i) < 2) return;

        let mid = Math.floor((end+start_i)/2);
        await Sorter.mergeSort(arr, start_i, mid);
        await Sorter.mergeSort(arr, mid, end);
        await Sorter.#merge(arr, start_i, mid, end);
    }

    static async quickSort(arr, start_i=0, end=arr.length) {
        let size = (end-start_i);
        if(size <= 2) {
            if (size == 2 && arr[start_i] > arr[end-1]) {
                await Promise.all([selectIndex(Sorter.delayMillis, start_i), 
                                   selectIndex(Sorter.delayMillis, end-1)]);
                Sorter.#swap(arr, start_i, end-1);
            } else await selectIndex(Sorter.delayMillis, start_i);
            return;
        }

        let pivot_i;
        await Sorter.#partition(arr, start_i, end).then(res => { pivot_i = res; });
        await Promise.all([selectIndex(Sorter.delayMillis, pivot_i),
                           Sorter.quickSort(arr, start_i, pivot_i)]);
        await Promise.all([selectIndex(Sorter.delayMillis, pivot_i),
                           Sorter.quickSort(arr, pivot_i+1, end)]);
    }
    
    static #run_size = 16; //should be a power of two
    static async timSort(arr, start_i=0, end=arr.length) {
        //insertion sort each run
        const size = (end-start_i);
        for(let start_insert_i = start_i; start_insert_i < end-1; start_insert_i+=Sorter.#run_size) {
            const end_insert = Math.min(start_insert_i+Sorter.#run_size, end);
            await Sorter.insertionSort(arr, start_insert_i, end_insert);
        }

        //merge
        for(let run_size = Sorter.#run_size; run_size <= size; run_size*=2) { //while the runs size is less than the size of the array
            //merge every run
            for(let start_merge_i = start_i; start_merge_i+run_size < end-1; start_merge_i+=(2*run_size)) {
                const start2_merge_i = start_merge_i+run_size;
                const end_merge = Math.min(start2_merge_i+run_size, end);
    
                await Sorter.#merge(arr, start_merge_i, start2_merge_i, end_merge);
            }
        }
    }

    static #comb_shrink_factor = 1.3;
    static async combSort(arr, start_i=0, end=arr.length) {
        let swap = true;
        let gap_size = end-start_i;
        while (swap == true || gap_size != 1) {
            swap = false;
            let left_i = start_i, right_i = left_i+gap_size;
            while (right_i < end) {
                await Promise.all([selectIndex(Sorter.delayMillis, left_i),
                                   selectIndex(Sorter.delayMillis, right_i)]);
                if (arr[left_i] > arr[right_i]) {
                    Sorter.#swap(arr, left_i, right_i);
                    swap = true;
                }
                left_i++;
                right_i++;
            }
            gap_size = Math.max(1, Math.floor(gap_size/Sorter.#comb_shrink_factor));
        }
    }

    static async brickSort(arr, start_i=0, end=arr.length) {
        let swap_even = true, swap_odd = true;
        let offset = 1; //1 or 0
        while(swap_even || swap_odd) {
            if(offset == 0) {
                offset = 1;
                swap_even = false;
            }
            else {
                offset = 0;
                swap_odd = false;
            }

            for(let right_i = start_i+offset+1; right_i < end; right_i+=2) {
                const left_i = right_i-1;
                await Promise.all([selectIndex(Sorter.delayMillis, left_i),
                                   selectIndex(Sorter.delayMillis, right_i)]);
                if (arr[left_i] > arr[right_i]) {
                    Sorter.#swap(arr, left_i, right_i);
                    if (offset == 0) swap_odd = true;
                    else swap_even = true;
                }
            }
        }
    }

    static async gnomeSort(arr, start_i=0, end=arr.length) {
        let right_i = start_i+1;
        while(right_i < end) {
            if(right_i == start_i) right_i++;
            const left_i = right_i-1;
            await Promise.all([selectIndex(Sorter.delayMillis, left_i),
                               selectIndex(Sorter.delayMillis, right_i)]);

            if(arr[left_i] > arr[right_i]) {
                Sorter.#swap(arr, left_i, right_i);
                right_i--;
            } else right_i++;
        }
    }

    static async introSort(arr, start_i=0, end=arr.length) {
        await Sorter.#introSort(arr, 2*Math.log(end-start_i), start_i, end);
    }

    static #get_shell_gap_size(n) {
        //OEIS: A000225
        return Math.pow(2,n)-1; 
    }

    static async shellSort(arr, start_i=0, end=arr.length) {
       let gap_num = Math.floor(Math.log(end-start_i)/Math.LN2);
        for(let gap_size = 0; gap_size != 1; gap_num--) {
            gap_size = Sorter.#get_shell_gap_size(gap_num);

            for(let i = start_i+gap_size; i < end; i++) {
                let insert_i = i-gap_size, right_i = i;
                while(insert_i >= start_i) {
                    await Promise.all([selectIndex(Sorter.delayMillis, right_i), 
                                       selectIndex(Sorter.delayMillis, insert_i)]);
                    if (arr[insert_i] <= arr[right_i]) break;
                    Sorter.#swap(arr, insert_i, right_i);
                    right_i = insert_i;
                    insert_i -= gap_size;
                }
            }
        }
    }

    static async cocktailSort(arr, start_i=0, end=arr.length) {
        let sorted_right_i = end, 
            sorted_left_i = start_i-1;
        let inc = 1;
        while (sorted_left_i < sorted_right_i) {
            let swap_left_i = sorted_right_i, 
                swap_right_i = sorted_left_i;

            let right_i;
            if (inc == 1) right_i = sorted_left_i+2;
            else right_i = sorted_right_i-1;
            let left_i = right_i-1;
            while (right_i < sorted_right_i && left_i > sorted_left_i) {
                await Promise.all([selectIndex(Sorter.delayMillis, right_i), 
                                   selectIndex(Sorter.delayMillis, left_i)]);
                if(arr[left_i] > arr[right_i]) {
                    Sorter.#swap(arr, left_i, right_i);
                    if (inc == 1) swap_right_i = right_i;
                    else swap_left_i = left_i;
                }
                right_i+=inc;
                left_i+=inc;
            }
            if(inc == 1) {
                sorted_right_i = swap_right_i;
                inc = -1;
            }
            else {
                sorted_left_i = swap_left_i;
                inc = 1;
            }
        }
    }

    //private helper methods
    static #swap(arr, i1, i2) {
        let tmp = arr[i1];
        arr[i1] = arr[i2];
        arr[i2] = tmp;
    }

    static async #getLargestI(arr, start_i=0, end=arr.length) {
        let largest_i = start_i;
        for(let i = start_i+1; i < end; i++) {
            if(arr[i] > arr[largest_i]) largest_i = i;
            await selectIndex(Sorter.delayMillis, i);
        }
        return largest_i;
    }

    static async #heapify(arr, root_i=0, end=arr.length) {
        let largest_i = root_i,
            left_i = (2*root_i)+1,
            right_i = 2*(root_i)+2;

        await Promise.all([selectIndex(Sorter.delayMillis, root_i),
                           selectIndex(Sorter.delayMillis, left_i),
                           selectIndex(Sorter.delayMillis, right_i)]);
        if (left_i < end && arr[left_i] > arr[largest_i]) largest_i = left_i;
        if (right_i < end && arr[right_i] > arr[largest_i]) largest_i = right_i;
        if (largest_i == root_i) return;

        Sorter.#swap(arr, root_i, largest_i);
        await Sorter.#heapify(arr, largest_i, end);
    }

    static async #merge(arr, start1_i, start2_i, end) {
        let ret = [];
        let container1_i = start1_i, container2_i = start2_i;

        for(let i = 0; i < (end-start1_i); i++) {
            await Promise.all([selectIndex(Sorter.delayMillis, container1_i),
                               selectIndex(Sorter.delayMillis, container2_i)]);
            if((container1_i < start2_i) && (container2_i >= end || arr[container1_i] <= arr[container2_i])) {
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

    static async #partition(arr, start_i=0, end=arr.length) {
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

    static #introSort_inertion_size = 16;
    static async #introSort(arr, depth, start_i=0, end=arr.length) {
        if (end-start_i <= Sorter.#introSort_inertion_size) await Sorter.insertionSort(arr, start_i, end); 
        else if (depth == 0) await Sorter.heapSort(arr, start_i, end);
        else {
            //quicksort
            let pivot_i;
            await Sorter.#partition(arr, start_i, end).then(res => { pivot_i = res; });
            await Promise.all([selectIndex(Sorter.delayMillis, pivot_i),
                               Sorter.#introSort(arr, depth-1, start_i, pivot_i)]);
            await Promise.all([selectIndex(Sorter.delayMillis, pivot_i),
                               Sorter.#introSort(arr, depth-1, pivot_i+1, end)]);
        }
    }
}