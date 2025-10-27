// Global variables
let memorySize = 0;
let memoryBlocks = [];
let processes = [];
let lastAllocatedIndex = -1; // For Next Fit algorithm

// DOM Elements
const createMemoryBtn = document.getElementById('create-memory');
const createBlocksBtn = document.getElementById('create-blocks');
const allocateBtn = document.getElementById('allocate');
const clearBtn = document.getElementById('clear');

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    createMemoryBtn.addEventListener('click', initializeMemory);
    createBlocksBtn.addEventListener('click', createMemoryBlocks);
    allocateBtn.addEventListener('click', allocateProcess);
    clearBtn.addEventListener('click', clearAllData);
    
    // Initial explanation
    updateAlgorithmExplanation();
    
    // Update explanation when algorithm changes
    document.getElementById('algorithm').addEventListener('change', updateAlgorithmExplanation);
});

// Initialize memory size
function initializeMemory() {
    memorySize = parseInt(document.getElementById('memory-size').value);
    
    if (isNaN(memorySize) || memorySize <= 0) {
        alert('Please enter a valid memory size');
        return;
    }
    
    // Reset everything
    memoryBlocks = [];
    processes = [];
    updateMemoryVisualization();
    
    // Show success message
    alert(`Memory initialized with size ${memorySize} KB`);
}

// Create memory blocks based on user input
function createMemoryBlocks() {
    if (memorySize <= 0) {
        alert('Please initialize memory first');
        return;
    }
    
    const blockSizesInput = document.getElementById('block-sizes').value;
    
    // Parse input
    const blockSizes = blockSizesInput.split(',')
        .map(size => parseInt(size.trim()))
        .filter(size => !isNaN(size) && size > 0);
    
    if (blockSizes.length === 0) {
        alert('Please enter valid block sizes');
        return;
    }
    
    // Check if total size exceeds memory size
    const totalSize = blockSizes.reduce((sum, size) => sum + size, 0);
    if (totalSize > memorySize) {
        alert(`Total block size (${totalSize} KB) exceeds memory size (${memorySize} KB)`);
        return;
    }
    
    // Create memory blocks
    memoryBlocks = blockSizes.map((size, index) => ({
        id: index,
        size: size,
        allocated: false,
        processId: null,
        fragmentation: 0
    }));
    
    // Reset processes when new blocks are created
    processes = [];
    lastAllocatedIndex = -1;
    
    updateMemoryVisualization();
}

// Allocate process using selected algorithm
function allocateProcess() {
    const processId = document.getElementById('process-id').value.trim();
    const processSize = parseInt(document.getElementById('process-size').value);
    const algorithm = document.getElementById('algorithm').value;
    
    // Validation
    if (!processId) {
        alert('Please enter a process ID');
        return;
    }
    
    if (isNaN(processSize) || processSize <= 0) {
        alert('Please enter a valid process size');
        return;
    }
    
    if (memoryBlocks.length === 0) {
        alert('Please create memory blocks first');
        return;
    }
    
    // Check if process ID already exists
    if (processes.some(p => p.id === processId)) {
        alert(`Process with ID ${processId} already exists`);
        return;
    }
    
    // Call the appropriate allocation algorithm
    let allocated = false;
    let blockIndex = -1;
    
    switch (algorithm) {
        case 'first-fit':
            blockIndex = firstFit(processSize);
            break;
        case 'best-fit':
            blockIndex = bestFit(processSize);
            break;
        case 'worst-fit':
            blockIndex = worstFit(processSize);
            break;
        case 'next-fit':
            blockIndex = nextFit(processSize);
            break;
    }
    
    if (blockIndex !== -1) {
        // Allocate the process
        memoryBlocks[blockIndex].allocated = true;
        memoryBlocks[blockIndex].processId = processId;
        memoryBlocks[blockIndex].fragmentation = memoryBlocks[blockIndex].size - processSize;
        
        processes.push({
            id: processId,
            size: processSize,
            blockId: blockIndex,
            algorithm: algorithm
        });
        
        // Update visualization
        updateMemoryVisualization();
        updateProcessTable();
        showAllocationStep(blockIndex, processId, processSize, algorithm);
    } else {
        alert(`Cannot allocate process ${processId} (${processSize} KB) using ${formatAlgorithmName(algorithm)}`);
    }
}

// First Fit algorithm implementation
function firstFit(processSize) {
    for (let i = 0; i < memoryBlocks.length; i++) {
        if (!memoryBlocks[i].allocated && memoryBlocks[i].size >= processSize) {
            return i;
        }
    }
    return -1; // No suitable block found
}

// Best Fit algorithm implementation
function bestFit(processSize) {
    let bestFitIndex = -1;
    let bestFitSize = Infinity;
    
    for (let i = 0; i < memoryBlocks.length; i++) {
        if (!memoryBlocks[i].allocated && 
            memoryBlocks[i].size >= processSize && 
            memoryBlocks[i].size < bestFitSize) {
            bestFitIndex = i;
            bestFitSize = memoryBlocks[i].size;
        }
    }
    
    return bestFitIndex;
}

// Worst Fit algorithm implementation
function worstFit(processSize) {
    let worstFitIndex = -1;
    let worstFitSize = -1;
    
    for (let i = 0; i < memoryBlocks.length; i++) {
        if (!memoryBlocks[i].allocated && 
            memoryBlocks[i].size >= processSize && 
            memoryBlocks[i].size > worstFitSize) {
            worstFitIndex = i;
            worstFitSize = memoryBlocks[i].size;
        }
    }
    
    return worstFitIndex;
}

// Next Fit algorithm implementation
function nextFit(processSize) {
    if (lastAllocatedIndex === -1) {
        // If no previous allocation, use First Fit
        lastAllocatedIndex = firstFit(processSize);
        return lastAllocatedIndex;
    }
    
    // Start search from the last allocated block
    let startIndex = (lastAllocatedIndex + 1) % memoryBlocks.length;
    let i = startIndex;
    
    do {
        if (!memoryBlocks[i].allocated && memoryBlocks[i].size >= processSize) {
            lastAllocatedIndex = i;
            return i;
        }
        i = (i + 1) % memoryBlocks.length;
    } while (i !== startIndex);
    
    return -1; // No suitable block found
}

// Update the memory visualization
function updateMemoryVisualization() {
    const memoryContainer = document.getElementById('memory-container');
    memoryContainer.innerHTML = '';
    
    // Create memory visualization
    const memoryVis = document.createElement('div');
    memoryVis.className = 'memory-visualization';
    memoryContainer.appendChild(memoryVis);
    
    // Calculate the total width
    const totalWidth = memoryBlocks.reduce((sum, block) => sum + block.size, 0);
    let currentPosition = 0;
    
    // Create block visualizations
    memoryBlocks.forEach((block, index) => {
        const blockPercentage = (block.size / memorySize) * 100;
        
        const blockElement = document.createElement('div');
        blockElement.className = `block ${block.allocated ? 'allocated' : 'free'}`;
        blockElement.style.left = `${(currentPosition / memorySize) * 100}%`;
        blockElement.style.width = `${blockPercentage}%`;
        
        const labelText = block.allocated 
            ? `${block.processId} (${block.size} KB - Frag: ${block.fragmentation} KB)` 
            : `Free (${block.size} KB)`;
            
        blockElement.innerHTML = `<span class="block-label">${labelText}</span>`;
        memoryVis.appendChild(blockElement);
        
        currentPosition += block.size;
    });
    
    // Create detailed block representations for better visibility
    memoryBlocks.forEach((block, index) => {
        const blockDiv = document.createElement('div');
        blockDiv.className = `memory-block ${block.allocated ? 'allocated-block' : 'free-block'}`;
        
        let blockInfo = block.allocated 
            ? `Block ${index}: ${block.processId} (${block.size} KB)` 
            : `Block ${index}: Free (${block.size} KB)`;
            
        if (block.allocated) {
            blockInfo += ` - Fragmentation: ${block.fragmentation} KB`;
        }
        
        blockDiv.textContent = blockInfo;
        memoryContainer.appendChild(blockDiv);
    });
}

// Update the process table
function updateProcessTable() {
    const processList = document.getElementById('process-list');
    processList.innerHTML = '';
    
    processes.forEach(process => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${process.id}</td>
            <td>${process.size} KB</td>
            <td>Block ${process.blockId}</td>
            <td>${formatAlgorithmName(process.algorithm)}</td>
            <td>
                <button class="remove-process" data-id="${process.id}">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </td>
        `;
        
        processList.appendChild(row);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-process').forEach(button => {
        button.addEventListener('click', function() {
            const processId = this.getAttribute('data-id');
            deallocateProcess(processId);
        });
    });
}

// Deallocate a process
function deallocateProcess(processId) {
    const processIndex = processes.findIndex(p => p.id === processId);
    
    if (processIndex !== -1) {
        const process = processes[processIndex];
        
        // Free the memory block
        const blockIndex = process.blockId;
        memoryBlocks[blockIndex].allocated = false;
        memoryBlocks[blockIndex].processId = null;
        memoryBlocks[blockIndex].fragmentation = 0;
        
        // Remove process from array
        processes.splice(processIndex, 1);
        
        // Update visualization
        updateMemoryVisualization();
        updateProcessTable();
    }
}

// Clear all data
function clearAllData() {
    memoryBlocks = [];
    processes = [];
    lastAllocatedIndex = -1;
    updateMemoryVisualization();
    updateProcessTable();
}

// Format algorithm name for display
function formatAlgorithmName(algorithm) {
    switch (algorithm) {
        case 'first-fit': return 'First Fit';
        case 'best-fit': return 'Best Fit';
        case 'worst-fit': return 'Worst Fit';
        case 'next-fit': return 'Next Fit';
        default: return algorithm;
    }
}

// Show detailed allocation steps
function showAllocationStep(blockIndex, processId, processSize, algorithm) {
    const block = memoryBlocks[blockIndex];
    
    // Highlight the allocated block
    const blockElements = document.querySelectorAll('.memory-block');
    blockElements[blockIndex].classList.add('highlight');
    
    setTimeout(() => {
        blockElements[blockIndex].classList.remove('highlight');
    }, 2000);
}

// Update the algorithm explanation
function updateAlgorithmExplanation() {
    const algorithm = document.getElementById('algorithm').value;
    const explanationDiv = document.getElementById('explanation');
    
    switch (algorithm) {
        case 'first-fit':
            explanationDiv.innerHTML = `
                <h3>First Fit Algorithm</h3>
                <p>Allocates the first memory block that is large enough to accommodate the process.</p>
                <ul>
                    <li>Searches from the beginning of memory</li>
                    <li>Selects the first block that is large enough</li>
                    <li>Fast allocation time</li>
                    <li>May leave small fragments near the beginning of memory</li>
                </ul>
                <p><strong>Time Complexity:</strong> O(n) where n is the number of memory blocks</p>
            `;
            break;
        case 'best-fit':
            explanationDiv.innerHTML = `
                <h3>Best Fit Algorithm</h3>
                <p>Allocates the smallest memory block that is large enough to accommodate the process.</p>
                <ul>
                    <li>Searches through all memory blocks</li>
                    <li>Selects the block with the least amount of wasted space</li>
                    <li>Minimizes memory fragmentation</li>
                    <li>But leaves small unusable fragments scattered throughout memory</li>
                </ul>
                <p><strong>Time Complexity:</strong> O(n) where n is the number of memory blocks</p>
            `;
            break;
        case 'worst-fit':
            explanationDiv.innerHTML = `
                <h3>Worst Fit Algorithm</h3>
                <p>Allocates the largest memory block available for the process.</p>
                <ul>
                    <li>Searches through all memory blocks</li>
                    <li>Selects the largest available block</li>
                    <li>Leaves larger fragments that may be usable for future processes</li>
                    <li>May lead to inefficient memory usage over time</li>
                </ul>
                <p><strong>Time Complexity:</strong> O(n) where n is the number of memory blocks</p>
            `;
            break;
        case 'next-fit':
            explanationDiv.innerHTML = `
                <h3>Next Fit Algorithm</h3>
                <p>Similar to First Fit, but starts searching from the location of the last allocation.</p>
                <ul>
                    <li>Continues search from where the last search ended</li>
                    <li>More evenly distributes allocations throughout memory</li>
                    <li>Better performance than First Fit in some cases</li>
                    <li>May still lead to fragmentation</li>
                </ul>
                <p><strong>Time Complexity:</strong> O(n) where n is the number of memory blocks</p>
            `;
            break;
    }
} 