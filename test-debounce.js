const hotkeys = require('./hotkeys');

hotkeys.debounce(500, function (value, events) {
	console.log("INPUT:", value);
	if (value === "exit")
		process.exit(0);
});
