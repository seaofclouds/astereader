import { useState, useEffect } from "react";

export function useBullet(initialBullets, bulletSpeed) {
  const [bullets, setBullets] = useState(initialBullets);

  useEffect(() => {
	const intervalId = setInterval(() => {
	  setBullets((prevBullets) =>
		prevBullets.map((bullet) => {
		  let radian = bullet.rotation * Math.PI / 180;
		  bullet.x -= bulletSpeed * Math.sin(-radian);
		  bullet.y -= bulletSpeed * Math.cos(-radian);
		  return bullet;
		})
	  );
	}, 50); // Adjust as needed

	return () => {
	  clearInterval(intervalId);
	};
  }, [bulletSpeed]);

  return [bullets, setBullets];
}