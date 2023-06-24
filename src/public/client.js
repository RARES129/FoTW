const gamePageElement = document.querySelector('.game_page');
const scoreElement = document.querySelector('.score');
const timerElement = document.querySelector('.timer');
const movesElement = document.querySelector('.moves');


let selectedFruitElement = null; 


function selectFruit(event) {
  const fruitElement = event.target;
  fruitElement.classList.toggle('selected');
  selectedFruitElement = fruitElement;
}


updateScoreUI(0);

  function updateScoreUI(score) {
    const scoreElement = document.querySelector('.score');
    scoreElement.textContent = `Score: ${score}`;
  }
  

function fetchFruits() {
    fetch(`https://fruitsonthewebserver.onrender.com/game`)
      .then(response => response.json())
      .then(data => {
        const { fruits, score } = data;
        updateScoreUI(score);
        gamePageElement.innerHTML = '';
  

        for (const fruit of fruits) {
          const fruitElement = document.createElement('img');
          fruitElement.src = `/css/img/${fruit}.png`;
          fruitElement.classList.add('fruit');
          fruitElement.draggable = true;
          fruitElement.addEventListener('click', selectFruit);
          fruitElement.addEventListener('dragstart', dragStart);
          fruitElement.addEventListener('dragover', dragOver);
          fruitElement.addEventListener('dragenter', dragEnter);
          fruitElement.addEventListener('dragleave', dragLeave);
          fruitElement.addEventListener('drop', drop);
           console.log(score);

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
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (response.ok) {

        fetchFruits();
        updateScoreUI(score);
      } else {
        throw new Error('Restart failed');
      }
    })
    .catch((error) => {
      console.error('Failed to restart the level:', error);
    });
});


function restart(level) {
  const restartUrl = 'https://fruitsonthewebserver.onrender.com/game';


  const restartLogic = () => {
    fetch(restartUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ level }),
    })
      .then((response) => {
        if (response.ok) {
          location.reload();
          updateScoreUI(score);
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




function quitLevel() {

window.location.href = '/home';
}
function dragStart(event) {

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


  moveFruits(selectedFruitElement, event.target);
}


function swapFruits(selectedElement, destinationElement) {
  const tempSelected = selectedElement.cloneNode();
  const tempDestination = destinationElement.cloneNode();

  selectedElement.parentNode.replaceChild(tempDestination, selectedElement);
  destinationElement.parentNode.replaceChild(tempSelected, destinationElement);
}





function moveFruits(selectedElement, destinationElement) {

  const selectedFruitIndex = Array.from(gamePageElement.children).indexOf(selectedElement);
  const destinationFruitIndex = Array.from(gamePageElement.children).indexOf(destinationElement);

  const tempSelected = selectedElement.cloneNode();
  const tempDestination = destinationElement.cloneNode();


  selectedElement.parentNode.replaceChild(tempDestination, selectedElement);
  destinationElement.parentNode.replaceChild(tempSelected, destinationElement);


  fetch('https://fruitsonthewebserver.onrender.com/game/move', {
    method: 'POST',
    credentials: 'include',
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

        gamePageElement.innerHTML = '';

        for (const fruit of fruits) {
          const fruitElement = document.createElement('img');
          fruitElement.src = `/css/img/${fruit}.png`;
          fruitElement.classList.add('fruit');
          fruitElement.draggable = true; 
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
          updateScoreUI(score);
        }
      } else {
        throw new Error('Invalid move: The move does not result in a match.');
      }
    })
    .catch((error) => {
      console.error('Failed to move fruits:', error);

      tempSelected.parentNode.replaceChild(selectedElement, tempSelected);
      tempDestination.parentNode.replaceChild(destinationElement, tempDestination);
    });
}






