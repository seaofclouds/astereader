import React, { useState, useEffect, useRef } from "react";
import ScrollingText from "./ScrollingText";
import Bullet from "./Bullet";

const GameSpace = () => {
  const [text, setText] = useState("");
  const [rotation, setRotation] = useState(0);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const spaceship = useRef();
  const [bullets, setBullets] = useState([]);
  const [score, setScore] = useState(0);
const velocity = useRef({x: 0, y: 0});
  const acceleration = useRef({x: 0, y: 0});
  const speed = 0.05; // control this to change the spaceship's speed
  const [thrust, setThrust] = useState(0);

  useEffect(() => {
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
  }



	fetch("/content.txt")
	  .then((response) => response.text())
	  .then((data) => setText(highlightRandomWords(data)));
  }, []);

  useEffect(() => {
	setX(window.innerWidth / 2 - spaceship.current.offsetWidth / 2);
	setY(window.innerHeight / 2 - spaceship.current.offsetHeight / 2);
  }, []);

  useEffect(() => {
	const handleKeyDown = (e) => {
	  e.preventDefault();
	  switch(e.key) {
		case 'ArrowLeft':
		  setRotation(rotation => rotation - 10);
		  break;
		case 'ArrowRight':
		  setRotation(rotation => rotation + 10);
		  break;
		case 'ArrowUp':
			let radian = rotation * Math.PI / 180;
			setThrust(0.1); // Begin applying thrust when the up arrow is pressed

			acceleration.current = {
				x: -speed * Math.sin(-radian),
				y: -speed * Math.cos(-radian)
			};
			break;
		case 'ArrowDown':
			acceleration.current = { x: 0, y: 0 };  // To stop acceleration
			break;
          case ' ':
			setBullets(bullets => [
			  ...bullets,
			  { id: Date.now(), x: x + spaceship.current.offsetWidth / 2, y: y + spaceship.current.offsetHeight / 2, rotation, hit: false }
			]);
			break;
		default:
		  break;
	  }
	}
	
  const handleKeyUp = (e) => {
	  e.preventDefault();
	  switch(e.key) {
		case 'ArrowUp':
		  setThrust(0);
		  break;
	  }
	}
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', handleKeyUp);
	
	return () => {
	  window.removeEventListener('keydown', handleKeyDown);
	  window.removeEventListener('keyup', handleKeyUp);
	}
  }, [rotation, x, y]);
  
  useEffect(() => {
	const intervalId = setInterval(() => {
	  const spaceshipRect = spaceship.current.getBoundingClientRect();
	  
	  const highlightElements = document.getElementsByClassName('highlight');
	  for (let i = 0; i < highlightElements.length; i++) {
		if (highlightElements[i].classList.contains('hit')) {
		  continue; // Skip the element if it already has the hit class
		}
  
		const wordRect = highlightElements[i].getBoundingClientRect();
		// Check for collision
		if (
		  wordRect.left < spaceshipRect.right &&
		  wordRect.right > spaceshipRect.left &&
		  wordRect.top < spaceshipRect.bottom &&
		  wordRect.bottom > spaceshipRect.top
		) {
		// collision detected, invert colors
		  document.body.classList.add('invert');
		  setTimeout(() => {
			document.body.classList.remove('invert');
		  }, 500);		}
	  }
	}, 50);  // Check every 50ms
  
	return () => {
	  clearInterval(intervalId);
	}
  }, []);

  useEffect(() => {
	const intervalId = setInterval(() => {
	  setBullets(bullets => bullets
		.map(bullet => {
		  let radian = bullet.rotation * Math.PI / 180;
		  bullet.x -= bulletSpeed * Math.sin(-radian);
		  bullet.y -= bulletSpeed * Math.cos(-radian);
		  return bullet;
		})
		.filter(bullet => bullet.x >= 0 && bullet.x <= window.innerWidth && bullet.y >= 0 && bullet.y <= window.innerHeight)
	  );
	}, 50);  // Adjust as needed
  
	return () => {
	  clearInterval(intervalId);
	}
  }, []);
  
  const bulletSpeed = 5; // Declare the bulletSpeed variable here
  
  // add a new useEffect to update position with velocity and acceleration
useEffect(() => {
	const intervalId = setInterval(() => {
	  // Create a new acceleration vector at the current angle of rotation
	  acceleration.current.x = Math.sin(rotation * (Math.PI / 180)) * thrust;
	  acceleration.current.y = -Math.cos(rotation * (Math.PI / 180)) * thrust;
  
	  // Increase velocity by acceleration
	  velocity.current.x += acceleration.current.x;
	  velocity.current.y += acceleration.current.y;
  
	  // Decrease velocity by a small amount to simulate friction
	  velocity.current.x *= 0.99;
	  velocity.current.y *= 0.99;
  
	  let newX = x + velocity.current.x;
	  let newY = y + velocity.current.y;
  
	  // If spaceship exits right, reappear on left
	  if (newX > window.innerWidth) {
		newX = 0;
	  } 
	  // If spaceship exits left, reappear on right
	  else if (newX < 0) {
		newX = window.innerWidth;
	  }
  
	  // If spaceship exits bottom, reappear on top
	  if (newY > window.innerHeight) {
		newY = 0;
	  } 
	  // If spaceship exits top, reappear on bottom
	  else if (newY < 0) {
		newY = window.innerHeight;
	  }
  
	  setX(newX);
	  setY(newY);
	}, 50);
  
	return () => {
	  clearInterval(intervalId);
	};
  }, [x, y, rotation, thrust]);

  
useEffect(() => {
	const intervalId = setInterval(() => {
	  setBullets(bullets => bullets.map(bullet => {
		// Skip the bullet if it already hit a target
		if (bullet.hit) return bullet;
  
		let radian = bullet.rotation * Math.PI / 180;
		bullet.x -= bulletSpeed * Math.sin(-radian);
		bullet.y -= bulletSpeed * Math.cos(-radian);
  
		const highlightElements = document.getElementsByClassName('highlight');
		for (let i = 0; i < highlightElements.length; i++) {
		  const rect = highlightElements[i].getBoundingClientRect();
		  if (bullet.x >= rect.left && bullet.x <= rect.right && bullet.y >= rect.top && bullet.y <= rect.bottom) {
			bullet.hit = true;
		  highlightElements[i].classList.add('hit'); // Add the 'hit' class
			highlightElements[i].style.color = 'white';
  
			// Add score based on the type of the word
			if (highlightElements[i].classList.contains('highlight')) {
			  setScore(score => score + 5);
			} else if (highlightElements[i].classList.contains('em')) {
			  setScore(score => score + 10);
			} else if (highlightElements[i].classList.contains('strong')) {
			  setScore(score => score + 15);
			}
  
			break;
		  }
		}
  
		return bullet;
	  })
	  .filter(bullet => bullet.x >= 0 && bullet.x <= window.innerWidth && bullet.y >= 0 && bullet.y <= window.innerHeight));
	}, 50);  // Adjust as needed
  
	return () => {
	  clearInterval(intervalId);
	}
  }, []);

return (
	<div className="App-header">
	  <ScrollingText text={text} scrollSpeed={.25} />
	  <div className="spacecraft" ref={spaceship} style={{left: `${x}px`, top: `${y}px`, transform: `rotate(${rotation}deg)`}}>▲</div>

	  {bullets.map(bullet => <Bullet key={bullet.id} x={bullet.x} y={bullet.y} rotation={bullet.rotation} />)}
	  <div className="score">Score: {score}</div>
	</div>
  );

};

export default GameSpace;
