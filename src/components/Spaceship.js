const Spaceship = ({ x, y, rotation, spaceship, reset }) => {
  return (
  <div className="spacecraft" ref={spaceship} style={{ left: `${x}px`, top: `${y}px`, transform: `rotate(${rotation}deg)`}}>▲</div>
    
  );
}

export default Spaceship;