// React Imports
import React, { useState, useEffect } from "react";

// Component Imports
import ScrollingText from "./ScrollingText";
import Bullet from "./Bullet";
import Spaceship from './Spaceship';

// Hooks Imports
import { useBullet } from "./useBullet"; 
import useSpaceship from './useSpaceship';

// Main Functional Component
const GameSpace = () => {

  // State Variables
  const params = new URLSearchParams(window.location.search);
  const [gameState, setGameState] = useState("running");
  const [text, setText] = useState("");
  const [bullets, setBullets] = useBullet([], 5); // bulletSpeed is 5
  const [score, setScore] = useState(0);
  const [gameId, setGameId] = useState(0);
  const scrollSpeedParam = parseFloat(params.get('speed') ? params.get('speed') : '.25');
  const highlightWordsParam = parseFloat(params.get('targets') ? params.get('targets') : '.2');
  
  // The following variables can be uncommented if used in the future.
  // const acceleration;
  // const setRotation;
  // const velocity;
  // const speed;
  // const setThrust;
  
  const {
	  rotation,
	  x,
	  setX,
	  y,
	  setY,
	  lives,
	  setLives,
	  spaceship,
	  reset,
	  handleKeyDown,
	  handleKeyUp
} = useSpaceship(setBullets);
	
	/* Hook to add keydown and keyup event listeners */
  useEffect(() => {
	  window.addEventListener('keydown', handleKeyDown);
	  window.addEventListener('keyup', handleKeyUp);
  
	  return () => {
		window.removeEventListener('keydown', handleKeyDown);
		window.removeEventListener('keyup', handleKeyUp);
	  }
	}, [handleKeyDown, handleKeyUp]);

  /* Hook to fetch text data on game start */
	
	  useEffect(() => {
		if (gameState === "running") {
			const urlParams = new URLSearchParams(window.location.search);
			// const proxyUrl = "https://cors-anywhere.herokuapp.com/";
			const targetUrl = urlParams.get('text') || "/content.txt";
			// fetch(proxyUrl + targetUrl)
			fetch(targetUrl)
			  .then((response) => {
				if (!response.ok) {
				  throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.text()})
			  .then((data) => setText(highlightRandomWords(data)))
			  .catch((error) => {
				 console.log('Fetch failed: ', error);
				 fetch("/content.txt").then((response) => response.text()).then((data) => setText(highlightRandomWords(data))); // On error, load default text
			  });
		}
	  }, [gameState, gameId]);

	const restartGame = () => {
	  setGameState("running");
	  setScore(0);
	  setBullets([]);
	  setText("");
	  reset(); // Resets spaceship state via useSpaceship hook
	  document.body.classList.remove('game-over');
	  setGameId(gameId => gameId + 1);
	};
	
	/* Hook to reset spaceship position on game start */
	useEffect(() => {
		if (gameState === "running") {
		  setX(window.innerWidth / 2 - spaceship.current.offsetWidth / 2);
		  setY(window.innerHeight / 2 - spaceship.current.offsetHeight / 2);
		}
	  }, [gameState]);

// Function to Highlight Random Words 
	  const highlightRandomWords = (text) => {
		const words = text.split(/\b(?=\w)/); // Split text into words using positive lookahead to preserve spaces
	  
		for (let i = 0; i < words.length; i++) {
		  // Randomly decide whether to highlight this word
		  if (Math.random() < highlightWordsParam && ! /^\s*$/.test(words[i])) {
			let score = Math.floor(Math.random() * 3) + 1;
			words[i] = `<span class='highlight' data-score='${score * 5}'>${words[i]}</span>`;
		  }
		}
	  
		return words.join('');
	  };

  /* Hook to check collision with words every 50ms */
  useEffect(() => {
	const intervalId = setInterval(() => {

	  const spaceshipRect = spaceship.current.getBoundingClientRect();

	  const highlightElements = document.getElementsByClassName('highlight');
	  for (let i = 0; i < highlightElements.length; i++) {
		if (highlightElements[i].classList.contains('hit') || highlightElements[i].classList.contains('collided')) {
		  continue; // Skip the element if it already has the hit class or it has already collided
		}

		const wordRect = highlightElements[i].getBoundingClientRect();
		// Check for collision
		if (
		  wordRect.left < spaceshipRect.right &&
		  wordRect.right > spaceshipRect.left &&
		  wordRect.top < spaceshipRect.bottom &&
		  wordRect.bottom > spaceshipRect.top
		) {
		  highlightElements[i].classList.add('collided'); // Mark the element as having collided
		  setLives(lives => lives - 1);
		  // collision detected, invert colors
		  document.body.classList.add('invert');
		  setTimeout(() => {
			document.body.classList.remove('invert');
		  }, 500);
		}
	  }
	}, 50); // Check every 50ms

	return () => {
	  clearInterval(intervalId);
	}
  }, []);



  /* Hook to display game over message when lives run out */
  useEffect(() => {
	if (lives <= 0) {
	  // Fade to black and show "GAME OVER"
	  document.body.classList.add('game-over');
	}
  }, [lives]);

  /* Hook to handle bullets (create, move, hit, remove) */
  useEffect(() => {
	if (gameState === "running") {

	  const intervalId = setInterval(() => {
		setBullets((bullets) =>
		  bullets
			.map((bullet) => {
			  // Skip the bullet if it already hit a target
			  if (bullet.hit) {
				// Set a timeout to remove bullet after a short delay
				setTimeout(() => {
				  bullet.remove = true;
				}, 200); // 200 ms delay, adjust as needed
				return bullet;
			  }

			  const highlightElements = document.getElementsByClassName('highlight');
			  for (let i = 0; i < highlightElements.length; i++) {
				if (highlightElements[i].classList.contains('hit')) {
				  // Skip the check if word is already hit
				  continue;
				}
				const rect = highlightElements[i].getBoundingClientRect();
				if (
				  bullet.x >= rect.left &&
				  bullet.x <= rect.right &&
				  bullet.y >= rect.top &&
				  bullet.y <= rect.bottom
				) {
				  bullet.hit = true;
				  highlightElements[i].classList.add('hit'); // Add the 'hit' class

				  // Add score based on the type of the word
				  if (highlightElements[i].classList.contains('highlight')) {
					setScore((score) => score + 5);
				  } else if (highlightElements[i].classList.contains('em')) {
					setScore((score) => score + 10);
				  } else if (highlightElements[i].classList.contains('strong')) {
					setScore((score) => score + 15);
				  }

				  break;
				}
			  }

			  return bullet;
			})
			.filter(
			  (bullet) =>
				// Ensure bullets that are marked for removal are filtered out
				!bullet.remove &&
				bullet.x >= 0 &&
				bullet.x <= window.innerWidth &&
				bullet.y >= 0 &&
				bullet.y <= window.innerHeight
			)
		);
	  }, 20); // Adjust as needed

	  return () => {
		clearInterval(intervalId);
	  };
	}
  }, [gameState]);


  // Game render
  return (
	<div className="App-header">
	  <ScrollingText text={text} scrollSpeed={scrollSpeedParam} />
	  <Spaceship x={x} y={y} rotation={rotation} spaceship={spaceship} />

	{bullets.map(bullet => (
		<Bullet
		  key={bullet.id}
		  x={bullet.x}
		  y={bullet.y}
		  rotation={bullet.rotation}
		  hit={bullet.hit}
		/>
	  ))}
	  <div className="score">Score: {score}</div>
	  <div className="lives">Lives: {lives}</div>
	  <div className={`game-over-message ${lives <= 0 ? 'visible' : ''}`}>
		<h1>GAME OVER</h1>
		  <button onClick={restartGame} className={`restart-button ${lives <= 0 ? 'visible' : ''}`}>Read Again</button>
	  </div>
	</div>
  );

};

// Export Component
export default GameSpace;
