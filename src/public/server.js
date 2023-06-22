// server.js (server-side code)

const http = require('http');
const fs = require('fs');
const path = require('path');


// Define the game state
const fruits = ['banana', 'capsuna', 'orange', 'kiwi', 'strugure', 'applee'];
const totalColumns = 8;
const totalRows = 6;
const totalCells = totalColumns * totalRows;
let fruitElements = [];

// Create a randomized fruit grid
function createRandomizedFruitGrid() {
  fruitElements = [];
  for (let i = 0; i < totalCells; i++) {
    const randomFruit = getRandomFruit();
    fruitElements.push(randomFruit);
  }
}


// Get a random fruit
function getRandomFruit() {
  if (fruits.length === 0) {
    fruits.push('banana', 'capsuna', 'orange', 'kiwi', 'strugure', 'applee');
  }
  const randomIndex = Math.floor(Math.random() * fruits.length);
  return fruits.splice(randomIndex, 1)[0];
}


// Perform a move on the game board
function performMove(selectedIndex, destinationIndex) {
    const selectedFruit = fruitElements[selectedIndex];
    const destinationFruit = fruitElements[destinationIndex];
  
    // Swap the fruits
    fruitElements[selectedIndex] = destinationFruit;
    fruitElements[destinationIndex] = selectedFruit;
  
    // Check if the move results in a match
    const matchedIndexes = checkMatches();
    if (matchedIndexes.length > 0) {
      removeFruits(matchedIndexes);
      replacePoppedFruits();
      generateNewFruits();
      performAutoPop(); 
    } else {
      // Revert the swap if no match is formed
      fruitElements[selectedIndex] = selectedFruit;
      fruitElements[destinationIndex] = destinationFruit;
    }
  }
  
  // Perform automatic popping of matched fruits
  function performAutoPop() {
    let hasMatchedFruits = true;
    while (hasMatchedFruits) {
      const matchedIndexes = checkMatches();
      if (matchedIndexes.length > 0) {
        removeFruits(matchedIndexes);
        replacePoppedFruits();
        generateNewFruits();
      } else {
        hasMatchedFruits = false;
      }
    }
  }
  


// Check for matches of 3 or more fruits
function checkMatches() {
  const matchedIndexes = [];

  // Check horizontally for matches
  for (let row = 0; row < totalRows; row++) {
    let currentFruit = fruitElements[row * totalColumns];
    let count = 1;
    for (let col = 1; col < totalColumns; col++) {
      const index = row * totalColumns + col;
      if (fruitElements[index] === currentFruit) {
        count++;
      } else {
        if (count >= 3) {
          // Found a match
          for (let i = col - count; i < col; i++) {
            matchedIndexes.push(row * totalColumns + i);
          }
        }
        currentFruit = fruitElements[index];
        count = 1;
      }
    }
    if (count >= 3) {
      // Found a match at the end of the row
      for (let i = totalColumns - count; i < totalColumns; i++) {
        matchedIndexes.push(row * totalColumns + i);
      }
    }
  }

  // Check vertically for matches
  for (let col = 0; col < totalColumns; col++) {
    let currentFruit = fruitElements[col];
    let count = 1;
    for (let row = 1; row < totalRows; row++) {
      const index = row * totalColumns + col;
      if (fruitElements[index] === currentFruit) {
        count++;
      } else {
        if (count >= 3) {
          // Found a match
          for (let i = row - count; i < row; i++) {
            matchedIndexes.push(i * totalColumns + col);
          }
        }
        currentFruit = fruitElements[index];
        count = 1;
      }
    }
    if (count >= 3) {
      // Found a match at the end of the column
      for (let i = totalRows - count; i < totalRows; i++) {
        matchedIndexes.push(i * totalColumns + col);
      }
    }
  }

  return matchedIndexes;
}

// Remove fruits at the matched indexes
function removeFruits(matchedIndexes) {
  for (const index of matchedIndexes) {
    fruitElements[index] = null;
  }
}

// Replace popped fruits with fruits from above
function replacePoppedFruits() {
  for (let col = 0; col < totalColumns; col++) {
    let emptyCount = 0;
    for (let row = totalRows - 1; row >= 0; row--) {
      const index = row * totalColumns + col;
      if (fruitElements[index] === null) {
        emptyCount++;
      } else if (emptyCount > 0) {
        const newIndex = (row + emptyCount) * totalColumns + col;
        fruitElements[newIndex] = fruitElements[index];
        fruitElements[index] = null;
      }
    }
  }
}

// Generate new fruits to fill the empty spaces
function generateNewFruits() {
  for (let col = 0; col < totalColumns; col++) {
    for (let row = totalRows - 1; row >= 0; row--) {
      const index = row * totalColumns + col;
      if (fruitElements[index] === null) {
        fruitElements[index] = getRandomFruit();
      }
    }
  }
}


function serveStaticFile(req, res) {
    const filePath = path.join(__dirname, 'css', 'img', req.url);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not Found');
      } else {
        const extension = path.extname(filePath);
        let contentType = 'text/plain';
        if (extension === '.png') {
          contentType = 'image/png';
        } else if (extension === '.jpg' || extension === '.jpeg') {
          contentType = 'image/jpeg';
        }
        res.setHeader('Content-Type', contentType);
        res.end(data);
      }
    });
  }
  
  const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://fruitsonthewebserver.onrender.com/');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }
  
    // Handle other requests
    if (req.method === 'GET' && req.url === '/game') {
      // Return the game state
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ fruits: fruitElements }));
    } else if (req.method === 'POST' && req.url === '/game/restart') {
      // Reset the game state
      createRandomizedFruitGrid();
      res.statusCode = 200;
      res.end();
    } else if (req.method === 'POST' && req.url === '/game/move') {
      // Handle a move request
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        const { selectedIndex, destinationIndex } = JSON.parse(body);
        performMove(selectedIndex, destinationIndex);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ fruits: fruitElements }));
      });
    } else {
      // Serve static files
      serveStaticFile(req, res);
    }
  });
  
  const port = 3001;
  server.listen(port, () => {
    createRandomizedFruitGrid();
    console.log(`Server running on port ${port}`);
  });