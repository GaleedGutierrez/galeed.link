import { onCLS, onINP, onLCP } from "web-vitals";

// Google Analytics
function gtag() {
	dataLayer.push(arguments);
}

window.dataLayer = window.dataLayer || [];
gtag("js", new Date());
gtag("config", "G-M8H4YB694S");

// Web Vitals
function sendToGoogleAnalytics({ name, delta, id }) {
	gtag("event", name, {
		event_category: "Web Vitals",
		event_label: id,
		value: Math.round(name === "CLS" ? delta * 1000 : delta),
		non_interaction: true,
	});
}

onCLS(sendToGoogleAnalytics);
onINP(sendToGoogleAnalytics);
onLCP(sendToGoogleAnalytics);

// function gtag() {
// 				dataLayer.push(arguments);
// 			}

// 			window.dataLayer = window.dataLayer || [];
// 			gtag("js", new Date());
// 			gtag("config", "G-M8H4YB694S");
// function sendToGoogleAnalytics({ name, delta, id }) {
// 				gtag("event", name, {
// 					event_category: "Web Vitals",
// 					event_label: id,
// 					value: Math.round(name === "CLS" ? delta * 1000 : delta),
// 					non_interaction: true,
// 				});
// 			}

// 			(function () {
// 				var script = document.createElement("script");
// 				script.src =
// 					"https://unpkg.com/web-vitals@5/dist/web-vitals.iife.js";
// 				script.onload = function () {
// 					// When loading `web-vitals` using a classic script, all the public
// 					// methods can be found on the `webVitals` global namespace.
// 					webVitals.onCLS(sendToGoogleAnalytics);
// 					webVitals.onINP(sendToGoogleAnalytics);
// 					webVitals.onLCP(sendToGoogleAnalytics);
// 				};
// 				document.head.appendChild(script);
// 			})();
