import { useState, useRef, useEffect } from "react";

const useSpaceship = (setBullets) => {
  const [rotation, setRotation] = useState(0);
  const velocity = useRef({x: 0, y: 0});
  const acceleration = useRef({x: 0, y: 0});
  const speed = 0.05; // control this to change the spaceship's speed
  const [thrust, setThrust] = useState(0);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [lives, setLives] = useState(3); // or any initial value you want
  const spaceship = useRef(null);


  const reset = () => {
	setRotation(0);
	velocity.current = { x: 0, y: 0 };
	acceleration.current = { x: 0, y: 0 };
	setThrust(0);
	setX(window.innerWidth / 2 - spaceship.current.offsetWidth / 2);
	setY(window.innerHeight / 2 - spaceship.current.offsetHeight / 2);
	setLives(3);
  };
  
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

		const bulletOffsetX = 4;
		const bulletOffsetY = 20;
		setBullets(bullets => [
		  ...bullets,
		  { 
		  id: Date.now(), 
		  x: x + spaceship.current.offsetWidth / 2 - bulletOffsetX, 
		  y: y + spaceship.current.offsetHeight / 2 - bulletOffsetY,
		  rotation, 
		  hit: false 
		  }
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
	default:
	  break;
	}
  }

  // Continuously update spaceship position based on velocity and acceleration
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
  
  
  return {
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
	reset,
	handleKeyDown,
	handleKeyUp
  }
};

export default useSpaceship;
