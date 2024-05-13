const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.static('public'));

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const filePath = './largeTextFile.txt';
    const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    let buffer = '';

    // Function to send chunks of text
    const sendChunk = () => {
        if (buffer.length > 0) {
            let chunk = buffer.substring(0, 100);
            buffer = buffer.substring(100);
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        } else {
            clearInterval(intervalId); // Stop the interval when no more data is left
            res.write('event: close\n');
            res.write('data: Stream ended\n\n');
            res.end();
            console.log('File has been completely streamed and connection closed.');
        }
    };

    // Interval to send chunks every 4 seconds
    const intervalId = setInterval(sendChunk, 4000);

    readStream.on('data', (chunk) => {
        buffer += chunk;
        // Try to send immediately if enough data is accumulated
        if (buffer.length >= 100) {
            sendChunk();
        }
    });

    readStream.on('end', () => {
        // Once the file is read, ensure remaining data is sent
        if (buffer.length > 0) {
            sendChunk();  // Ensure final chunk is sent
        }
    });

    readStream.on('error', (error) => {
        res.write('event: error\n');
        res.write(`data: ${JSON.stringify(error.message)}\n\n`);
        res.end();
    });

    // Clean up on client disconnect
    req.on('close', () => {
        clearInterval(intervalId); // Stop sending data on client disconnect
        readStream.destroy();      // This ensures the stream is closed
        res.end();
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
