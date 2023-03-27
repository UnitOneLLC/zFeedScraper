// scrapeInject.js
// Copyright (c) 2023 Frederick F. Hewett All Rights Reserved

(function() {
	
	var dates = [], hours = [], minutes = [], seconds = [], elevs = [], cals = [], dists = [], watts = [];

	document.querySelectorAll("div[data-testid=activity-date-on-activity-card").forEach((dt)=>{dates.push(dt.textContent);});
	document.querySelectorAll("div[data-testid=activity-calories-value]").forEach((c)=>cals.push(parseInt(c.textContent)));
	document.querySelectorAll("div[data-testid=activity-distance-value]").forEach((c)=>dists.push(parseFloat(c.textContent)));
	document.querySelectorAll("div[data-testid=activity-elevation-or-pace-value]").forEach((c)=>elevs.push(parseInt(c.textContent)));
	document.querySelectorAll("div[data-testid=activity-time-value]").forEach( (c)=> {
		const regex = /(\d+)h\s+(\d+)m\s+(\d+)s/;
		var s = c.textContent;
		if (s.indexOf("h") == -1) {
			s = "0h " + s;
		}
		if (s.indexOf("m") == -1) {
			var hIndex = s.indexOf("h ");
			s = s.slice(0, hIndex + 3) + " 0m " + s.slice(hIndex + 3);
		}
		if (s.indexOf("s") == -1) {
			s = s + " 0s";
		}
		
		const matches = s.match(regex);
		if (matches == null || !matches.length) {
			alert("match failed |" + s + "|");
		} else {
			hours.push(parseInt(matches[1]));
			minutes.push(parseInt(matches[2]));
			seconds.push(parseInt(matches[3]));
		}
	});

	const EFFICIENCY_FACTOR = 0.25;
	for (var i=0; i < dates.length; ++i) {
		var secs = hours[i]*3600 + minutes[i]*60 + seconds[i];
		watts[i] = Math.round(cals[i]*1000/secs * 4.1868 * EFFICIENCY_FACTOR);
	}

	return {
		"dates": dates,
		"hours": hours,
		"minutes": minutes,
		"seconds": seconds,
		"elevs": elevs,
		"calories": cals,
		"distances": dists,
		"watts" : watts
	};
})();
