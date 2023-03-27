// zFeedScraper.js
// Copyright (c) 2023 Frederick F. Hewett  All Rights Reserved

const ZWIFT_URL = "https://www.zwift.com/feed";
const WAIT_MSG = "Please wait while your workouts are being loaded. Do not click away.";
const URL_MSG = "This extension only works on the Zwift feed page.";
const ERR_MSG = "An error occurred.";

var lastScrollY;

function gebi(id) { return document.getElementById(id);}
function hide(id) {
	var elem = (id instanceof HTMLElement) ? id : gebi(id);
	elem.style.display = 'none'
};
function show(id, dStyle) {
	var elem = (id instanceof HTMLElement) ? id : gebi(id);
	elem.style.display = dStyle ? dStyle : "block";
}

document.addEventListener("DOMContentLoaded", ()=>
		{
			gebi("copy-btn").addEventListener("click", doTableCopy);
			hide("table-container");
			hide("copy-btn");
			
			lastScrollY = -1;
			
			getCurrentUrl( (t) => {
				if (!t || (t.url != ZWIFT_URL)) {
					setMessage(URL_MSG);
					show("zwift-link");
					gebi("zwift-link").addEventListener("click", () => { 
						chrome.tabs.create({
							url: ZWIFT_URL
						});
					});
					return;
				}
		
				setMessage(WAIT_MSG, "images/biker.gif");
				scrollAllWorkouts();
			});
		}
	);

function getCurrentUrl(f) {
	try {
		chrome.tabs.query({active: true, currentWindow: true}).then((tabs=>f(tabs[0])));
	}
	catch (e) {
		f(null);
	}
}

function scrollAllWorkouts() {
	chrome.tabs.query({active: true, currentWindow: true}).then(
		(tabs)=>{
			var t = tabs[0];
			return chrome.scripting.executeScript( {
				target: {tabId: t.id}, 
				files: ['scrollInject.js']
			}).then((injectResult)=>{
				waitForLoad();
			},
				reason => {alert(ERR_MSG); error("activation ** ", reason)}
			)
		});
}

function doTableCopy() {
	
	var frame = gebi("table-container");
	var end = gebi("end-copy");
	var table = gebi("scrape-table");
	
	table.style.marginLeft = table.style.marginRight = "0";
	
	var range = document.createRange();
	
	range.setStart(frame, 0);
	range.setEnd(end, 0);
	
	var selObj = window.getSelection()
	selObj.removeAllRanges();
	selObj.addRange(range);
	
	if (document.execCommand('copy')) {
		gebi("copied-msg").textContent = "Data copied to clipboard";
	} else {
		error("doTableCopy", "failed to copy table")
	}
	
	table.style.marginLeft = table.style.marginRight = "auto";	
	
	if (window.getSelection().empty)
		window.getSelection().empty();
}

function waitForLoad() {
	const QUERY_INTERVAL=2000;
	var queryLoop = ()=>{
		chrome.tabs.query({active: true, currentWindow: true}).then(
			(tabs)=>{
				var t = tabs[0];
				return chrome.scripting.executeScript( {
					target: {tabId: t.id}, 
					files: ['queryInject.js']
				}).then((injectResult)=>{
					var currentScrollY = injectResult[0].result["scrollY"];
					if (currentScrollY != 0 && currentScrollY == lastScrollY) {
						scrape();
					}
					else {
						lastScrollY = currentScrollY;
						queryTimer = setTimeout(queryLoop, QUERY_INTERVAL);
					}
				},
					reason => {alert(ERR_MSG + " " + reason); error("waitForLoad ** ", reason)}
				)
			});
	};
	var queryTimer = setTimeout(queryLoop, QUERY_INTERVAL);
}


function scrape() {
	var buildTable = (scraped)=> {
		var addCell = (row,text)=> {
			const cell = document.createElement('td');
			const textNode = document.createTextNode(text);
			cell.appendChild(textNode);
			row.appendChild(cell);
		};
		
		var n = scraped["dates"].length;
		var table = gebi("scrape-table");
		for (var i=0; i < n; ++i) {
			var row = document.createElement("tr");
			
			addCell(row, scraped["dates"][i]);
			addCell(row, scraped["hours"][i]);
			addCell(row, scraped["minutes"][i]);
			addCell(row, scraped["seconds"][i]);
			addCell(row, scraped["distances"][i]);
			addCell(row, scraped["elevs"][i]);
			addCell(row, scraped["calories"][i]);
			addCell(row, scraped["watts"][i]);
			
			table.appendChild(row);
		}
		show("table-container");
		show("copy-btn", 'inline');
	};
	
	chrome.tabs.query({active: true, currentWindow: true}).then(
		(tabs)=>{
			var t = tabs[0];
			return chrome.scripting.executeScript( {
				target: {tabId: t.id}, 
				files: ['scrapeInject.js']
			}).then((injectResult)=>{
				setMessage(null);
				buildTable(injectResult[0].result);
			},
				reason => {
					setMessage(ERR_MSG + " " + reason);
					error("activation ** ", reason);
				}
			)
		});
}

function setMessage(msg, imgSrc) { var msgArea = gebi("msg-area");
	var imgElem = gebi("msg-img");	
	
	if (!msg) {
		hide(msgArea);
	}
	else {
		show(msgArea);
		msgArea.textContent = msg;
	}

	if (imgSrc) {

		show(imgElem, "inline");
		imgElem.src = imgSrc;
	}
	else {
		hide(imgElem);
	}
}


function error(loc, reason) {
	console.log("Error: " + loc +  (reason ? (": " + reason) : ""));
}
