// client.js

const gamePageElement = document.querySelector('.game_page');
const scoreElement = document.querySelector('.score');
const timerElement = document.querySelector('.timer');
const movesElement = document.querySelector('.moves');

// Global variables
let selectedFruitElement = null; // Tracks the currently selected fruit element
let remainingMoves = 25; // Maximum number of moves allowed for the level

// Add the selected class to the clicked fruit element
function selectFruit(event) {
    const fruitElement = event.target;
    fruitElement.classList.toggle('selected');
    selectedFruitElement = fruitElement;
  }
  
  // Update the score and remaining moves
  function updateScore(points) {
    const currentScore = parseInt(scoreElement.textContent.replace('Score: ', ''), 10);
    const newScore = isNaN(currentScore) ? points : currentScore + points;
    scoreElement.textContent = `Score: ${newScore}`;
  
    if (newScore >= 1000) {
      displayLevelCompleteMessage();
    }
  
    remainingMoves--;
    movesElement.textContent = `Moves left: ${remainingMoves}`;
  
    if (remainingMoves === 0) {
      restartLevel();
    }
  }

function updateTimer(timeLeft) {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  timerElement.textContent = `Time left: ${minutes}:${seconds}`;
}

// Fetch the fruits from the server and generate the fruit grid
// Fetch the fruits from the server and generate the fruit grid
function fetchFruits() {
    fetch('http://0.0.0.0/game')
      .then(response => response.json())
      .then(data => {
        const { fruits } = data;
        gamePageElement.innerHTML = ''; // Clear the game page
  
        // Create fruit elements and append them to the game page
        for (const fruit of fruits) {
          console.log(fruit);
          const fruitElement = document.createElement('img');
          fruitElement.src = `./css/img/${fruit}.png`;
          fruitElement.classList.add('fruit');
          fruitElement.draggable = true; // Enable drag and drop
          fruitElement.addEventListener('click', selectFruit);
          fruitElement.addEventListener('dragstart', dragStart);
          fruitElement.addEventListener('dragover', dragOver);
          fruitElement.addEventListener('dragenter', dragEnter);
          fruitElement.addEventListener('dragleave', dragLeave);
          fruitElement.addEventListener('drop', drop);
  
          // Set the max-width and max-height properties for the fruit image
          fruitElement.style.maxWidth = '85%';
          fruitElement.style.maxHeight = '85%';
          fruitElement.style.verticalAlign = 'middle';
          gamePageElement.appendChild(fruitElement);
        }
  
        const numRows = Math.ceil(fruits.length / 8);
        gamePageElement.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;
      })
      .catch(error => {
        console.error('Failed to fetch fruits:', error);
      });
  }
  
  

// Call the fetchFruits function to fetch and generate the fruit grid
fetchFruits();

// Restart level button click handler
function restartLevel() {
    remainingMoves = 25; // Reset remaining moves to the maximum number
    fetch('/game/restart', { method: 'POST' })
      .then(response => {
        if (response.ok) {
          // Restart successful, fetch new fruits and refresh the page
          fetchFruits();
          window.location.reload();
        } else {
          throw new Error('Restart failed');
        }
      })
      .catch(error => {
        console.error('Failed to restart the level:', error);
      });
  }
// Quit level button click handler
function quitLevel() {
  // Redirect to the select level page
  window.location.href = '/home';
}

// Drag and Drop event handlers

function dragStart(event) {
  // Store the dragged fruit element
  selectedFruitElement = event.target;
}

function dragOver(event) {
  event.preventDefault();
}

function dragEnter(event) {
  event.preventDefault();
  event.target.classList.add('hovered');
}

function dragLeave(event) {
  event.target.classList.remove('hovered');
}

function drop(event) {
  event.preventDefault();
  event.target.classList.remove('hovered');

  // Move the selected fruit to the dropped fruit element
  moveFruits(selectedFruitElement, event.target);
}

// Swap the fruits locally
function swapFruits(selectedElement, destinationElement) {
  const tempSelected = selectedElement.cloneNode();
  const tempDestination = destinationElement.cloneNode();

  selectedElement.parentNode.replaceChild(tempDestination, selectedElement);
  destinationElement.parentNode.replaceChild(tempSelected, destinationElement);
}

  
  // Display "Congrats! Level Complete" message
  function displayLevelCompleteMessage() {
    const messageElement = document.createElement('div');
    messageElement.textContent = 'Congrats! Level Complete';
    messageElement.classList.add('level-complete-message');
    gamePageElement.appendChild(messageElement);
  }

// Move the selected fruit to the destination fruit element
function moveFruits(selectedElement, destinationElement) {
    // Clone the selected and destination fruits
    const tempSelected = selectedElement.cloneNode();
    const tempDestination = destinationElement.cloneNode();
  
    // Replace the selected fruit with the destination fruit locally
    selectedElement.parentNode.replaceChild(tempDestination, selectedElement);
    destinationElement.parentNode.replaceChild(tempSelected, destinationElement);
  
    // Find the indices of the selected and destination fruits
    const selectedFruitIndex = Array.from(gamePageElement.children).indexOf(tempSelected);
    const destinationFruitIndex = Array.from(gamePageElement.children).indexOf(tempDestination);
  
    // Send a move request to the server
    fetch('http://localhost:3001/game/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        selectedIndex: selectedFruitIndex,
        destinationIndex: destinationFruitIndex
      })
    })
    .then(response => {
        if (response.status === 200) {
          console.log('Move request successful');
          updateScore(50); // Add 50 points to the score
          return response.json();
        } else {
          throw new Error('Move request failed');
        }
      })
      .then(data => {
        const { fruits } = data;
        // Update the fruit grid based on the response from the server
        gamePageElement.innerHTML = '';
  
        for (const fruit of fruits) {
          const fruitElement = document.createElement('img');
          fruitElement.src = `/css/img/${fruit}.png`;
          fruitElement.classList.add('fruit');
          fruitElement.draggable = true; // Enable drag and drop
          fruitElement.addEventListener('click', selectFruit);
          fruitElement.addEventListener('dragstart', dragStart);
          fruitElement.addEventListener('dragover', dragOver);
          fruitElement.addEventListener('dragenter', dragEnter);
          fruitElement.addEventListener('dragleave', dragLeave);
          fruitElement.addEventListener('drop', drop);
          fruitElement.style.maxWidth = '85%';
          fruitElement.style.maxHeight = '85%';
          fruitElement.style.verticalAlign = 'middle';
          gamePageElement.appendChild(fruitElement);

          
          const selectedFruitName = fruits[selectedFruitIndex];
          const destinationFruitName = fruits[destinationFruitIndex];
          console.log(`Replaced ${selectedFruitName} with ${destinationFruitName}`);
        }
      })
      .catch(error => {
        console.error('Failed to move fruits:', error);
        // Restore the swapped fruits in case of an error
        selectedElement.parentNode.replaceChild(selectedElement, tempDestination);
        destinationElement.parentNode.replaceChild(destinationElement, tempSelected);
      });
  }
  
