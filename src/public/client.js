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



  function updateScoreUI(score) {
    scoreElement.textContent = `Score: ${score}`;
  }


function fetchFruits() {
    fetch(`http://localhost:3001/game`)
      .then(response => response.json())
      .then(data => {
        const { fruits, score} = data;
        updateScoreUI(score);
        gamePageElement.innerHTML = '';
  

        for (const fruit of fruits) {
          const fruitElement = document.createElement('img');
          fruitElement.src = `/css/img/${fruit}.png`;
          fruitElement.classList.add('fruit');
          fruitElement.draggable = true;
          fruitElement.addEventListener('touchstart', selectFruit);
          fruitElement.addEventListener('touchmove', touchMove);
          fruitElement.addEventListener('touchend', touchEnd);
          fruitElement.addEventListener('touchcancel', touchCancel);
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


function restart() {
  const restartUrl = 'http://localhost:3001/game';

  const restartLogic = () => {
    fetch(restartUrl, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Restart failed');
        }
      })
      .then((data) => {
        updateScoreUI(data.score);
        return fetchFruits();
      })
      .then(() => {
        setTimeout(() => {
          location.reload();
        }, 100);
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
  event.dataTransfer.setData("text/plain", event.target.id);
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

  const validDropTarget = event.target.classList.contains('fruit');
  const isAdjacent = isAdjacentPosition(selectedFruitElement, event.target);

  if (validDropTarget && isAdjacent) {
    moveFruits(selectedFruitElement, event.target);
  }
}

function touchStart(event) {
  event.preventDefault();
  const touch = event.touches[0];
  const fruitElement = document.elementFromPoint(touch.clientX, touch.clientY);
  selectedFruitElement = fruitElement;
}
function touchMove(event) {
  event.preventDefault();
}

function touchEnd(event) {
  event.preventDefault();
  const touch = event.changedTouches[0];
  const fruitElement = document.elementFromPoint(touch.clientX, touch.clientY);

  const validDropTarget = fruitElement.classList.contains('fruit');
  const isAdjacent = isAdjacentPosition(selectedFruitElement, fruitElement);

  if (validDropTarget && isAdjacent) {
    moveFruits(selectedFruitElement, fruitElement);
  }
}

function touchCancel(event) {
  event.preventDefault();
}

function isAdjacentPosition(selectedElement, targetElement) {
  const selectedFruitIndex = Array.from(gamePageElement.children).indexOf(selectedElement);
  const targetFruitIndex = Array.from(gamePageElement.children).indexOf(targetElement);

  const numCols = 8;

  const selectedRow = Math.floor(selectedFruitIndex / numCols);
  const selectedCol = selectedFruitIndex % numCols;

  const targetRow = Math.floor(targetFruitIndex / numCols);
  const targetCol = targetFruitIndex % numCols;

  const rowDiff = Math.abs(selectedRow - targetRow);
  const colDiff = Math.abs(selectedCol - targetCol);

  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}
function moveFruits(selectedElement, destinationElement) {
  const selectedFruitIndex = Array.from(gamePageElement.children).indexOf(selectedElement);
  const destinationFruitIndex = Array.from(gamePageElement.children).indexOf(destinationElement);

  const selectedFruitName = selectedElement.src.split('/').pop().split('.')[0];
  const destinationFruitName = destinationElement.src.split('/').pop().split('.')[0];

  const tempSelected = selectedElement.cloneNode();
  const tempDestination = destinationElement.cloneNode();

  selectedElement.parentNode.replaceChild(tempDestination, selectedElement);
  destinationElement.parentNode.replaceChild(tempSelected, destinationElement);

  fetch('http://localhost:3001/game/move', {
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
          fruitElement.addEventListener('touchstart', selectFruit);
          fruitElement.addEventListener('touchmove', touchMove);
          fruitElement.addEventListener('touchend', touchEnd);
          fruitElement.addEventListener('touchcancel', touchCancel);
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

        console.log(`Swapped ${selectedFruitName} with ${destinationFruitName}`);

        const selectedLevel = getCookie("selectedLevel");

        
        const levelTargets = {
          "2": 1250,
          "3": 1370,
          "4": 1490,
          "5": 1560,
          "6": 1600,
          "7": 1700,
          "8": 1800,
          "9": 1900,
          "10": 2000,
          "11": 2100,
          "12": 2400,
        };
        
        let targetScore = levelTargets[selectedLevel] || 1000;
        
        
        if (score > 0 && score < targetScore) {
          updateScoreUI(score);
        } else if (score >= targetScore) {
          alert("Congratulations! You have completed the level. Your score is: " + score + " points");
          window.location.href = "/select_lvl";
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



function getCookie(cookieName) {
  const name = cookieName + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }

  return "";
}








