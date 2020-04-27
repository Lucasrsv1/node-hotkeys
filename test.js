const hotkeys = require('./hotkeys');

hotkeys.on({
	hotkeys: 'alt + shift + a, alt + a, shift + a, ctrl + a, a, alt + shift + A, alt + A, shift + A, ctrl + A, A',
	matchAllModifiers: true,
	triggerAll: true,
	capitalization: true,
	callback: function (hotkey) {
		console.log("Activated:", hotkey);
	}
});

hotkeys.logRegisteredHotkeys();
