// inject.js
// Copyright (c) 2023 Frederick F. Hewett All Rights Reserved

(function() {
	const SCROLL_INTERVAL = 400;
	const SCROLL_INCREMENT = 800;
	const CLICK_INTERVAL = 500;	

	var clickTimer, scrolllTimer;
	scrollTo(0,0);
	
	var clickLoop = () => {
		
		var b = document.querySelector(".button--showmore"); 
		if (!b) {
			scrollTo(0,0);
			scrollTimer = setTimeout(scrollLoop, SCROLL_INTERVAL);
		}
		else {
			b.click();
			clickTimer = setTimeout(clickLoop, CLICK_INTERVAL)
		}
	};

	var scrollLoop = () => {
		
		if (window.scrollY + SCROLL_INCREMENT > document.body.offsetHeight - window.innerHeight) {
			scrollTo(0, document.body.offsetHeight - window.innerHeight - 1);
		}
		else {
			var nextY = Math.min(window.scrollY + SCROLL_INCREMENT, document.body.offsetHeight - window.innerHeight);
			if (nextY != 0)
				scrollTo(0, nextY);
			
			scrollTimer = setTimeout(scrollLoop, SCROLL_INTERVAL);
		}
	};

	clickTimer = setTimeout(clickLoop, CLICK_INTERVAL);

	return {status: true};
})();
