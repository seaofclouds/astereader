const Bullet = ({ x, y, rotation, hit }) => {
  return (
	<div
	  className={`${hit ? "bullet-shell" : "bullet"}`}
	  style={{
		left: `${x}px`,
		top: `${y}px`,
		transform: `rotate(${rotation}deg)`
	  }}
	>
	  {hit ? "*" : "|"}
	</div>
  );
};



export default Bullet;
