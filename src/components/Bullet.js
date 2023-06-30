const Bullet = ({ x, y, rotation, hit }) => {
  return (
	<div className="bullet"
	  style={{
		left: `${x}px`,
		top: `${y}px`,
		transform: `rotate(${rotation}deg)`,
		color: hit ? 'red' : 'white' 
	  }}
	>
	  {hit ? '*' : '|'}  
	</div>
  );
};


export default Bullet;
