// client.js

const gamePageElement = document.querySelector('.game_page');
const scoreElement = document.querySelector('.score');
const timerElement = document.querySelector('.timer');
const movesElement = document.querySelector('.moves');

// Global variables
let selectedFruitElement = null; // Tracks the currently selected fruit element

// Add the selected class to the clicked fruit element
function selectFruit(event) {
    const fruitElement = event.target;
    fruitElement.classList.toggle('selected');
    selectedFruitElement = fruitElement;
  }
  

  function updateScore(score) {
    const scoreElement = document.querySelector('.score');
    scoreElement.textContent = `Score: ${score}`;
  }
  
// Fetch the fruits from the server and generate the fruit grid
function fetchFruits() {
    fetch('https://fruitsonthewebserver.onrender.com/game')
      .then(response => response.json())
      .then(data => {
        const { fruits, score } = data;
        updateScore(score);
        gamePageElement.innerHTML = ''; // Clear the game page
  
        // Create fruit elements and append them to the game page
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
  
fetchFruits();

window.addEventListener('load', () => {
  fetch('https://fruitsonthewebserver.onrender.com/game', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (response.ok) {
        // Restart successful, fetch new fruits and refresh the page
        fetchFruits();
        updateScore(0);
      } else {
        throw new Error('Restart failed');
      }
    })
    .catch((error) => {
      console.error('Failed to restart the level:', error);
    });
});

// Function to restart the level or game based on the provided parameters
function restart(level) {
  const restartUrl = 'https://fruitsonthewebserver.onrender.com/game';

  // Common logic to restart the level or game
  const restartLogic = () => {
    fetch(restartUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ level }),
    })
      .then((response) => {
        if (response.ok) {
          location.reload();
          updateScore(0);
          fetchFruits();


        } else {
          throw new Error('Restart failed');
        }
      })
      .catch((error) => {
        console.error('Failed to restart:', error);
      });
  };

restartLogic();
}



// Quit level button click handler
function quitLevel() {
// Redirect to the select level page
window.location.href = '/home';
}
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


// Move the selected fruit to the destination fruit element
function moveFruits(selectedElement, destinationElement) {
  // Find the indices of the selected and destination fruits
  const selectedFruitIndex = Array.from(gamePageElement.children).indexOf(selectedElement);
  const destinationFruitIndex = Array.from(gamePageElement.children).indexOf(destinationElement);

  // Clone the selected and destination fruits
  const tempSelected = selectedElement.cloneNode();
  const tempDestination = destinationElement.cloneNode();

  // Replace the selected fruit with the destination fruit locally
  selectedElement.parentNode.replaceChild(tempDestination, selectedElement);
  destinationElement.parentNode.replaceChild(tempSelected, destinationElement);

  // Send a move request to the server
  fetch('https://fruitsonthewebserver.onrender.com/game/move', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      selectedIndex: selectedFruitIndex,
      destinationIndex: destinationFruitIndex,
    }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Move request failed');
      }
    })
    .then((data) => {
      const { fruits, score } = data;

      if (fruits) {
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
        }

        const selectedFruitName = fruits[selectedFruitIndex];
        const destinationFruitName = fruits[destinationFruitIndex];
        console.log(`Replaced ${selectedFruitName} with ${destinationFruitName}`);

        if (score > 0) {
          updateScore(score); // Add the updated score to the UI
        }
      } else {
        throw new Error('Invalid move: The move does not result in a match.');
      }
    })
    .catch((error) => {
      console.error('Failed to move fruits:', error);
      // Restore the swapped fruits in case of an error
      tempSelected.parentNode.replaceChild(selectedElement, tempSelected);
      tempDestination.parentNode.replaceChild(destinationElement, tempDestination);
    });
}






