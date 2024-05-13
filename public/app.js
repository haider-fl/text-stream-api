const eventSource = new EventSource('/events');
const messagesContainer = document.getElementById('messages');
let queue = []; // Queue to hold messages
let typing = false; // Flag to indicate if typing is in progress

eventSource.onmessage = function(event) {
    const messageData = JSON.parse(event.data);
    queue.push(messageData); // Add new message to the queue
    if (!typing) {
        processQueue(); // If not currently typing, start processing the queue
    }
};

eventSource.onerror = function(error) {
    console.error('EventSource failed:', error);
    eventSource.close();
    queue.push('Connection error occurred.');
    if (!typing) {
        processQueue();
    }
};

function processQueue() {
    if (queue.length > 0 && !typing) {
        typing = true; // Set typing flag
        typewriterEffect(queue.shift()); // Remove the first item from the queue and type it
    }
}

function typewriterEffect(text) {
    let i = 0;
    const speed = 50; // Speed of typewriter effect in milliseconds
    const messageElement = document.createElement('div'); // Create a new div for each message
    messagesContainer.appendChild(messageElement); // Append the div to the container

    function typeWriter() {
        if (i < text.length) {
            messageElement.textContent += text.charAt(i); // Add characters one by one to the div
            i++;
            setTimeout(typeWriter, speed);
        } else {
            typing = false; // Reset typing flag when done
            processQueue(); // Process the next message in the queue
        }
    }
    typeWriter();
}
