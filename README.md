# Memory Management Algorithm Simulator

A web-based simulation tool to visualize and understand memory management algorithms: First Fit, Best Fit, Worst Fit, and Next Fit.

## Features

- Interactive visualization of memory blocks and processes
- Implementation of four memory allocation algorithms:
  - First Fit: Allocates the first available memory block that is large enough
  - Best Fit: Allocates the smallest memory block that fits the process
  - Worst Fit: Allocates the largest memory block available
  - Next Fit: Similar to First Fit, but starts searching from the last allocated position
- Real-time visual representation of memory allocation
- Detailed explanations of how each algorithm works
- Process allocation and deallocation capabilities
- Internal fragmentation calculation and display

## How to Use

1. Open `index.html` in any modern web browser
2. Set the total memory size and click "Initialize Memory"
3. Create memory blocks by entering comma-separated block sizes (e.g., "100, 200, 300")
4. Enter a process ID and size, select an allocation algorithm, then click "Allocate Process"
5. Observe how the algorithm allocates memory and creates fragmentation
6. Remove processes as needed or clear all data to start over

## Understanding Memory Fragmentation

This simulator shows internal fragmentation, which occurs when a memory block assigned to a process is larger than the process itself. The difference between the block size and the process size is the fragmentation.

## Educational Use

This simulator is designed for educational purposes, particularly for:
- Computer Science students learning operating system concepts
- Understanding the pros and cons of different memory allocation strategies
- Visualizing memory management operations
- Solving numerical problems related to memory allocation

## Technologies Used

- HTML5
- CSS3
- JavaScript (vanilla, no frameworks)

## Browser Compatibility

Works in all modern browsers including:
- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari 
