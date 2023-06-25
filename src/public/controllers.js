const fs = require('fs');
const http = require('http');
const path = require('path');
const { MongoClient } = require('mongodb');
const cookie = require('cookie');

const mongoURL = process.env.DB_URL;
const dbName = process.env.DB_NAME;

const fruits = ['banana', 'capsuna', 'orange', 'kiwi', 'strugure', 'applee'];
const totalColumns = 8;
const totalRows = 6;
const totalCells = totalColumns * totalRows;
let fruitElements = [];
let score = 0;

async function resetScore(req, res) {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    const username = cookies.Username;
    const selectedLevel = cookies.selectedLevel;

    const client = new MongoClient(mongoURL);
    await client.connect();
    const db = client.db(dbName);

    const collection = db.collection("users");
    const user = await collection.findOne({ username });

    if (user) {
      const scoreField = `score${selectedLevel}`;
      const levelScore = user[scoreField];
      const totalScore = user.score - levelScore;

      await collection.updateOne(
        { username },
        { $set: { [scoreField]: 0, score: totalScore } }
      );

      score = 0;
    }

    await client.close();
  } catch (error) {
    console.error('Failed to reset level score:', error);
    throw error;
  }
}




  async function updateUserScore(username, selectedLevel, score) {
    try {
      const client = new MongoClient(mongoURL);
      await client.connect();
      const db = client.db(dbName);
  
      const collection = db.collection("users");
      const user = await collection.findOne({ username });
  
      const scoreField = `score${selectedLevel}`;
      const update = { $set: {} };
      update.$set[scoreField] = score;
  
      await collection.updateOne({ username }, update);
      await client.close();
  
      // Calculate total score after updating level score
      const totalScore = await calculateTotalScore(username);
      console.log('Total score:', totalScore);
    } catch (error) {
      console.error('Failed to update user score:', error);
      throw error;
    }
  }
  
  async function handleUpdateScoreRequest(req, res) {
    const url = 'http://localhost:3001/game/move';
    const cookies = cookie.parse(req.headers.cookie || "");
    const selectedLevel = cookies.selectedLevel;
  
    http.get(url, (response) => {
      let data = '';
  
      response.on('data', (chunk) => {
        data += chunk;
      });
  
      response.on('end', async () => {
        try {
          const jsonData = JSON.parse(data);
          const score = jsonData.score;
          const username = cookies.Username;
          await updateUserScore(username, selectedLevel, score);
        } catch (error) {
          console.error('Error parsing JSON content:', error);
        }
      });
    }).on('error', (error) => {
      console.error('Error making HTTP request:', error);
    });
  }
  
  async function calculateTotalScore(username) {
    try {
      const client = new MongoClient(mongoURL);
      await client.connect();
      const db = client.db(dbName);
  
      const collection = db.collection("users");
      const user = await collection.findOne({ username });
  
      const levelScores = Object.keys(user)
        .filter((key) => key.startsWith("score") && key !== "score")
        .map((key) => user[key]);
  
      const totalScore = levelScores.reduce((sum, score) => sum + score, 0);

      await collection.updateOne({ username }, { $set: { score: totalScore } });

  
      await client.close();
  
      return totalScore;
    } catch (error) {
      console.error('Failed to calculate total score:', error);
      throw error;
    }
  }
  
  
  
  
async function handleGameRequest(req, res) {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', async () => {
      await resetScore(req, res);
      createRandomizedFruitGrid();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ fruits: fruitElements, score: score }));
    });
  } else if (req.method === 'GET') {
    await resetScore(req, res);
    createRandomizedFruitGrid();
    score=0;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ fruits: fruitElements, score: score }));
  }
}

async function handleMoveRequest(req, res) {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const { selectedIndex, destinationIndex } = JSON.parse(body);
      performMove(selectedIndex, destinationIndex);
      handleUpdateScoreRequest(req, res)
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ fruits: fruitElements, score: score }));
    });
  } else if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ fruits: fruitElements, score: score }));
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

function createRandomizedFruitGrid() {
    fruitElements = [];
    for (let i = 0; i < totalCells; i++) {
      const randomFruit = getRandomFruit();
      fruitElements.push(randomFruit);
    }
  
    while (hasInitialMatches()) {
  
      fruitElements = [];
      for (let i = 0; i < totalCells; i++) {
        const randomFruit = getRandomFruit();
        fruitElements.push(randomFruit);
      }
    }
  
    performAutoPop();
  }
  
  function hasInitialMatches() {
    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < totalColumns; col++) {
        const index = row * totalColumns + col;
  
        if (col >= 2) {
          if (
            fruitElements[index] === fruitElements[index - 1] &&
            fruitElements[index] === fruitElements[index - 2]
          ) {
            return true;
          }
        }
  
        if (row >= 2) {
          if (
            fruitElements[index] === fruitElements[index - totalColumns] &&
            fruitElements[index] === fruitElements[index - 2 * totalColumns]
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }
  
  
  function getRandomFruit() {
    if (fruits.length === 0) {
      fruits.push('banana', 'capsuna', 'orange', 'kiwi', 'strugure', 'applee');
    }
    const randomIndex = Math.floor(Math.random() * fruits.length);
    return fruits.splice(randomIndex, 1)[0];
  }
  
  function isAdjacent(position1, position2) {
    const row1 = Math.floor(position1 / totalColumns);
    const col1 = position1 % totalColumns;
    const row2 = Math.floor(position2 / totalColumns);
    const col2 = position2 % totalColumns;
  
    return (
      (Math.abs(row1 - row2) === 1 && col1 === col2) ||
      (Math.abs(col1 - col2) === 1 && row1 === row2)
    );
  }
  
  
  function performMove(selectedIndex, destinationIndex) {
    const selectedFruit = fruitElements[selectedIndex];
    const destinationFruit = fruitElements[destinationIndex];
  
    if (!isAdjacent(selectedIndex, destinationIndex)) {
      console.log('Invalid move: The selected and destination positions are not adjacent.');
      return;
    }
  
    fruitElements[selectedIndex] = destinationFruit;
    fruitElements[destinationIndex] = selectedFruit;
  
    const matchedIndexes = checkMatches();
    if (matchedIndexes.length > 0) {
      removeFruits(matchedIndexes);
      replacePoppedFruits();
      generateNewFruits();
      performAutoPop();
      score += 10 * matchedIndexes.length;
    } else {
      fruitElements[selectedIndex] = selectedFruit;
      fruitElements[destinationIndex] = destinationFruit;
      console.log('Invalid move: The move does not result in a match.');
    }
  }
  
    
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
    
  
  
  function checkMatches() {
    const matchedIndexes = [];
  
    for (let row = 0; row < totalRows; row++) {
      let currentFruit = fruitElements[row * totalColumns];
      let count = 1;
      for (let col = 1; col < totalColumns; col++) {
        const index = row * totalColumns + col;
        if (fruitElements[index] === currentFruit) {
          count++;
        } else {
          if (count >= 3) {
            for (let i = col - count; i < col; i++) {
              matchedIndexes.push(row * totalColumns + i);
            }
          }
          currentFruit = fruitElements[index];
          count = 1;
        }
      }
      if (count >= 3) {
        for (let i = totalColumns - count; i < totalColumns; i++) {
          matchedIndexes.push(row * totalColumns + i);
        }
      }
    }
  
    for (let col = 0; col < totalColumns; col++) {
      let currentFruit = fruitElements[col];
      let count = 1;
      for (let row = 1; row < totalRows; row++) {
        const index = row * totalColumns + col;
        if (fruitElements[index] === currentFruit) {
          count++;
        } else {
          if (count >= 3) {
  
            for (let i = row - count; i < row; i++) {
              matchedIndexes.push(i * totalColumns + col);
            }
          }
          currentFruit = fruitElements[index];
          count = 1;
        }
      }
      if (count >= 3) {
  
        for (let i = totalRows - count; i < totalRows; i++) {
          matchedIndexes.push(i * totalColumns + col);
        }
      }
    }
  
    return matchedIndexes;
  }
  
  
  
  
  function removeFruits(matchedIndexes) {
    for (const index of matchedIndexes) {
      fruitElements[index] = null;
    }
  }
  
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
  
  function generateNewFruits() {
    for (let col = 0; col < totalColumns; col++) {
      for (let row = totalRows - 1; row >= 0; row--) {
        const index = row * totalColumns + col;
        if (fruitElements[index] === null) {
          fruitElements[index] = getRandomFruit();
        }
      }
    }
    performAutoPop(); 
  }



module.exports = {
  resetScore,
  handleGameRequest,
  handleMoveRequest,
  serveStaticFile,
  createRandomizedFruitGrid,
  hasInitialMatches
};
