const hotkeys = require('./hotkeys');

hotkeys.on({
	hotkeys: 'alt + shift + a, alt + a, shift + a, ctrl + a, a, alt + shift + A, alt + A, shift + A, ctrl + A, A',
	matchAllModifiers: true,
	triggerAll: true,
	capitalization: true,
	callback: hotkey => {
		console.log("Activated:", hotkey);
	}
});

hotkeys.on({
	hotkeys: 'left, up, right',
	matchAllModifiers: true,
	triggerAll: true,
	useKeyDown: true,
	callback: hotkey => {
		console.log("Arrow:", hotkey);
	}
});

hotkeys.logRegisteredHotkeys();

(async () => {
	while (true) {
		let hotkeyStr = await hotkeys.getNextHotkey();
		console.log("Detected:", hotkeyStr);
	}
})();
