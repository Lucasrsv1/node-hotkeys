const hotkeys = require('./hotkeys');

const key1 = hotkeys.debounce(500, (value, events) => {
	console.log("INPUT:", value);
	if (value === "exit")
		process.exit(0);
});

const key2 = hotkeys.debounce(1000, (value, events) => {
	console.log("TEMPORARY INPUT:", value);
});

setTimeout(() => {
	hotkeys.removeDebounce(key2);
	console.log("Temporary debounce listener removed.");
}, 10000);

console.log("\nRegistered debounce listeners:");
console.log(key1);
console.log(key2, "\n");
