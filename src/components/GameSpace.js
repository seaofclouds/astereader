import React, { useState, useEffect, useRef } from "react";
import ScrollingText from "./ScrollingText";
import Bullet from "./Bullet";
import {useBullet} from "./useBullet"; 
import useSpaceship from './useSpaceship';

// Main Functional Component
const GameSpace = () => {

  // State Variables
  const [gameState, setGameState] = useState("running");
  const [text, setText] = useState("");
  const [bullets, setBullets] = useBullet([], 5); // bulletSpeed is 5
  const [score, setScore] = useState(0);
  const [gameId, setGameId] = useState(0);
  const {
	  rotation,
	  acceleration,
	  setRotation,
	  velocity,
	  speed,
	  thrust,
	  setThrust,
	  x,
	  setX,
	  y,
	  setY,
	  lives,
	  setLives,
	  spaceship,
	  handleKeyDown,
	  handleKeyUp
} = useSpaceship(setBullets);
	  
  useEffect(() => {
	  window.addEventListener('keydown', handleKeyDown);
	  window.addEventListener('keyup', handleKeyUp);
  
	  return () => {
		window.removeEventListener('keydown', handleKeyDown);
		window.removeEventListener('keyup', handleKeyUp);
	  }
	}, [rotation, x, y, thrust]);


  // Function to reset the game state and variables
  // Reset game state and use the useSpaceship hook to reset spaceship variables
	const restartGame = () => {
	  setGameState("running");
	  setScore(0);
	  setBullets([]);
	  setText("");
	  spaceship.reset(); // Resets spaceship state via useSpaceship hook
	  document.body.classList.remove('game-over');
	  setGameId(gameId => gameId + 1);
	};

  // Function to Highlight Random Words 
  const highlightRandomWords = (text) => {
	const words = text.split(' ');
	for (let i = 0; i < words.length; i++) {
	  // Randomly decide whether to highlight this word
	  if (Math.random() < 0.1) {
		let score = Math.floor(Math.random() * 3) + 1;
		words[i] = `<span class='highlight' data-score='${score * 5}'> ${words[i]}</span>`;
	  }
	}
	return words.join(' ');
  };

  // UseEffect Hooks
  // Fetch text data on game start
  useEffect(() => {
	if (gameState === "running") {
	  fetch("/content.txt")
		.then((response) => response.text())
		.then((data) => setText(highlightRandomWords(data)));
	}
  }, [gameState, gameId]);

  // Reset spaceship position on game start
  useEffect(() => {
	  
	if (gameState === "running") {

	  setX(window.innerWidth / 2 - spaceship.current.offsetWidth / 2);
	  setY(window.innerHeight / 2 - spaceship.current.offsetHeight / 2);
	}
  }, [gameState]);


  // Check collision with words every 50ms
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



  // Display game over message when lives run out
  useEffect(() => {
	if (lives <= 0) {
	  // Fade to black and show "GAME OVER"
	  document.body.classList.add('game-over');
	}
  }, [lives]);

  // Handle bullets (create, move, hit, remove)
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
	  <ScrollingText text={text} scrollSpeed={.25} />
	  <div className="spacecraft" ref={spaceship} style={{left: `${x}px`, top: `${y}px`, transform: `rotate(${rotation}deg)`}}>▲</div>

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
