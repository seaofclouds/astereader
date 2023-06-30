import React, { useEffect, useRef, useState } from "react";

const ScrollingText = ({ text, scrollSpeed }) => {
  const scrollingTextRef = useRef();
  const highlightRefs = useRef([]);
  const observerRef = useRef();
  const [elements, setElements] = useState([]);

  // Set elements only once after first render
  useEffect(() => {
	setElements(textToElements(text));
  }, [text]);

  useEffect(() => {
	const scrollingTextElement = scrollingTextRef.current;
	let scrollPosition = 0;

	const scrollText = () => {
	  if (scrollPosition > scrollingTextElement.scrollHeight) {
		scrollPosition = 0;
	  } else {
		scrollPosition += scrollSpeed;
	  }

	  scrollingTextElement.scrollTop = scrollPosition;

	  requestAnimationFrame(scrollText);
	};

	scrollText();
  }, [scrollSpeed]);

  useEffect(() => {
	// Initialize MutationObserver once after first render
	if (!observerRef.current) {
	  observerRef.current = new MutationObserver(() => {
		highlightRefs.current = highlightRefs.current.filter(Boolean);
	  });

	  observerRef.current.observe(scrollingTextRef.current, {
		childList: true,
		subtree: true,
	  });
	}
  }, []);

  // Function to convert HTML to elements and highlight some words
  const textToElements = (html) => {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");
	const words = doc.body.textContent.split(" ");

return words.map((word, index) => {
	  const isHighlight = Math.random() > .95; // 10% chance to highlight a word
	  return isHighlight ? (
		<span
		  ref={(el) => (highlightRefs.current[index] = el)}
		  key={index}
		  data-id={index}
		  className="highlight"
		>
		  {word}
		</span>
	  ) : (
		word + " "
	  );
	});

  };

return (
	<div ref={scrollingTextRef} className="scrolling-text">
	  {elements}
	</div>
  );

};

export default ScrollingText;
