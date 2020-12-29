/**
 * @typedef Hotkey hotkey definition
 * @property {string} hotkeyStr hotkey definition as string
 * @property {boolean} shiftKey defines if the shift key is part of this hotkey
 * @property {boolean} altKey defines if the alt key is part of this hotkey
 * @property {boolean} ctrlKey defines if the ctrl key is part of this hotkey
 * @property {boolean} matchAllModifiers defines if all the modifiers of the event must be equal to the ones defined in this hotkey
 * @property {boolean} useKeyDown defines if keydown events are valid for hotkey detection
 * @property {Function} callback defines what callback function must be called if this hotkey is pressed
 * @property {number} [keychar] ASCII code of the input (takes capitalization into consideration)
 * @property {number} [rawcode] code of the button pressed (doesn't take capitalization into consideration)
 * @property {Hotkey[]} [hotkeys] definition of each hotkey that make up this setup (used only if the `triggerAll` option was `true`)
 */

/**
 * @typedef KeypressEvent event emitted when the user presses a key
 * @property {boolean} shiftKey `true` if the shift key was pressed
 * @property {boolean} altKey `true` if the alt key was pressed
 * @property {boolean} ctrlKey `true` if the ctrl key was pressed
 * @property {number} keychar ASCII code of the input (takes capitalization into consideration)
 * @property {number} rawcode code of the button pressed (doesn't take capitalization into consideration)
 */

/**
 * @typedef HotkeysOptions hotkeys configurations
 * @property {string} hotkeys hotkeys definitions separated by comma if more than one hotkey is setup
 * @property {Function} callback defines what callback function must be called if this hotkey is pressed
 * @property {string} [splitKey] character used to split a hotkey into the buttons that compose it
 * @property {boolean} [triggerAll] determines whether to call the callback function for each hotkey that may compose this configuration
 * @property {boolean} [capitalization] determines whether to differentiate uppercase and lowercase letters
 * @property {boolean} [matchAllModifiers] determines whether all the modifiers of the event must be equal to the hotkey setup
 * @property {boolean} [useKeyDown] determines whether to listen to keydown events
 */

/**
 * @callback DebounceListenerCallback called when the listener is triggered
 * @param {string} value input content
 * @param {KeypressEvent[]} events input events list
 */

/**
 * @typedef DebounceListener listener definition
 * @property {number} triggerTime how long, in ms, until triggering the listener
 * @property {Date} start stores the moment in which the first input happened
 * @property {string} value current saved value
 * @property {KeypressEvent[]} events current saved events list
 * @property {DebounceListenerCallback} callback defines what callback function must be called if this listener is triggered
 */

const iohook = require('iohook');

const charsMap = {
	"backspace": 8,
	"tab": 9,
	"enter": 13,
	"capslock": 20,
	"esc": 27,
	"pgup": 33,
	"space": 32,
	"pgdn": 34,
	"end": 35,
	"home": 36,
	"left": 37,
	"up": 38,
	"right": 39,
	"down": 40,
	"prtsc": 44,
	"insert": 45,
	"delete": 46,
	"cmd": 91,
	"F1": 112,
	"F2": 113,
	"F3": 114,
	"F4": 115,
	"F5": 116,
	"F6": 117,
	"F7": 118,
	"F8": 119,
	"F9": 120,
	"F10": 121,
	"F11": 122,
	"F12": 123
};

/**
 * @type {Hotkey[]} hotkeys in use
 */
var _registeredHotkeys = [];

/**
 * @type {DebounceListener[]} debounce listeners in use
 */
var _registeredDebounceListeners = [];

/**
 * @type {Promise<string>} promise used when waiting for an event that will be translated into a hotkey string definition
 */
var _pendingPromise = null;

/**
 * @type {Function} function that resolves the _pendingPromise
 */
var _promiseResolve = null;

/**
 * @type {Boolean} determine if keydown events are valid hotkeys
 */
var _includingKeydownEvent = false;

/**
 * Identifies hotkeys and set them to be compared to keypress events
 * @param {HotkeysOptions} options hotkey configuration options
 * @returns {Hotkey[]} list of hotkeys definitions
 */
function _getHotkeysFromOptions (options) {
	let hotkeys = [];
	options.splitKey = options.splitKey || "+";
	options.capitalization = options.capitalization || false;
	options.matchAllModifiers = options.matchAllModifiers || false;
	options.useKeyDown = options.useKeyDown || false;

	let cmds = options.hotkeys.split(",").map(s => s.trim());
	for (let cmd of cmds) {
		let keys = [];
		if (cmd.indexOf(options.splitKey))
			keys = cmd.split(options.splitKey).map(s => s.trim());
		else
			keys = cmd;

		let hotkey = {
			hotkeyStr: cmd,
			shiftKey: keys.indexOf('shift') != -1,
			altKey: keys.indexOf('alt') != -1,
			ctrlKey: keys.indexOf('ctrl') != -1,
			matchAllModifiers: options.matchAllModifiers,
			useKeyDown: options.useKeyDown
		};

		let lastKey = keys[keys.length - 1];
		if (lastKey in charsMap) {
			hotkey.rawcode = charsMap[lastKey];
		} else if (lastKey === "plus") {
			hotkey.keychar = '+'.charCodeAt(0);
		} else if (["ctrl", "shift", "alt"].includes(lastKey)) {
			switch (lastKey) {
				case "shift":
					hotkey.rawcode = 160;
					break;
				case "ctrl":
					hotkey.rawcode = 162;
					break;
				case "alt":
					hotkey.rawcode = 164;
					break;
			}
		} else {
			if (lastKey.length > 1)
				throw new Error(`The key ${lastKey} is invalid.`);

			// If capitalization doesn't matter and the key is a letter
			if (!options.capitalization && lastKey.match(/[a-z]/i))
				hotkey.rawcode = lastKey.toUpperCase().charCodeAt(0);
			else
				hotkey.keychar = lastKey.charCodeAt(0);
		}

		hotkeys.push(hotkey);
	}

	return hotkeys;
}

/**
 * Determines if the hotkey was activated by the event
 * @param {Hotkey} hotkey hotkey object to be tested against the event
 * @param {KeypressEvent|Hotkey} event user's keypress event
 * @returns {boolean} whether a hotkey was activated
 */
function _testHotkey (hotkey, event) {
	// Match main key
	if (Object.keys(hotkey).indexOf("rawcode") !== -1) {
		// Match using button pressed
		if (hotkey.rawcode != event.rawcode)
			return false;
	} else {
		// Match using ASCII
		if (hotkey.keychar != event.keychar)
			return false;
	}

	// Match modifiers
	let modifiers = ["altKey", "ctrlKey", "shiftKey"];
	for (let modifier of modifiers) {
		if (hotkey.matchAllModifiers) {
			if (hotkey[modifier] !== event[modifier])
				return false;
		} else {
			// If the modifier was required and the event doesn't have it
			if (hotkey[modifier] && !event[modifier])
				return false;
		}
	}

	return true;
}

/**
 * Register hotkeys to be monitored
 * @param {HotkeysOptions} options hotkey configuration options
 */
function registerHotkey (options) {
	options.triggerAll = options.triggerAll || false;

	let hotkeys = _getHotkeysFromOptions(options);
	if (options.triggerAll) {
		for (let hotkey of hotkeys) {
			hotkey.callback = options.callback;
			_registeredHotkeys.push(hotkey);
		}
	} else {
		_registeredHotkeys.push({
			hotkeys: hotkeys,
			hotkeyStr: options.hotkeys.trim(),
			callback: options.callback
		});
	}
}

/**
 * Stop monitoring determined hotkeys
 * @param {HotkeysOptions} options hotkey configuration options.
 * PS: matchAllModifiers will automatically be set `true`
 */
function removeHotkey (options) {
	options.matchAllModifiers = true;
	let hotkeys = _getHotkeysFromOptions(options);

	_registeredHotkeys = _registeredHotkeys.filter(entry => {
		for (let hotkey of hotkeys) {
			if (entry.hotkeys) {
				let toRemove = [];
				for (let i = 0; i < entry.hotkeys.length; i++) {
					if (_testHotkey(hotkey, entry.hotkeys[i]))
						toRemove.push(i);
				}

				entry.hotkeys = entry.hotkeys.filter((h, idx) => toRemove.indexOf(idx) === -1);
				if (entry.hotkeys.length === 0)
					return false;

				entry.hotkeyStr = entry.hotkeys.reduce((r, h) => {
					r.push(h.hotkeyStr);
					return r;
				}, []).join(",");
			} else {
				if (_testHotkey(hotkey, entry))
					return false;
			}
		}

		return true;
	});
}

/**
 * Translates a keypress event into a hotkey string definition
 * @param {KeypressEvent} event user's keypress event
 * @returns {string} the hotkey string definition
 */
function _toHotkeyStr (event) {
	let hotkeyStr = [];
	if (event.altKey)
		hotkeyStr.push("alt");

	if (event.ctrlKey)
		hotkeyStr.push("ctrl");

	if (event.shiftKey)
		hotkeyStr.push("shift");

	let found = false;
	for (let key in charsMap) {
		if (event.rawcode == charsMap[key]) {
			hotkeyStr.push(key);
			found = true;
			break;
		}
	}

	if (!found) {
		if (event.keychar === '+'.charCodeAt(0))
			hotkeyStr.push("plus");
		else if (![160, 162, 164].includes(event.rawcode))
			hotkeyStr.push(String.fromCharCode(event.keychar));
	}

	return hotkeyStr.join(" + ");
}

/**
 * Wait the debounce time until triggering the listener
 * @param {DebounceListener} listener listener being evaluated
 * @param {number} ms time until next trigger check
 */
function _handleDebounce (listener, ms) {
	setTimeout(() => {
		let timePassed = new Date() - listener.start;
		if (timePassed >= listener.triggerTime) {
			listener.callback(listener.value, listener.events);
			listener.value = "";
			listener.events = [];
			listener.start = null;
		} else {
			_handleDebounce(listener, listener.triggerTime - timePassed);
		}
	}, ms);
}

/**
 * Add input to debounce listeners
 * @param {KeypressEvent} event user's keypress event
 */
function _handleInputs (event) {
	for (let listener of _registeredDebounceListeners) {
		listener.events.push(event);
		listener.value += String.fromCharCode(event.keychar);

		if (!listener.start)
			_handleDebounce(listener, listener.triggerTime);

		listener.start = new Date();
	}
}

/**
 * Register a new debounce listener
 * @param {number} ms debounce time until triggering the listener
 * @property {DebounceListenerCallback} callback defines what callback function must be called if this listener is triggered
 */
function debounce (ms, callback) {
	_registeredDebounceListeners.push({
		triggerTime: ms,
		started: false,
		value: "",
		events: [],
		callback
	});
}

/**
 * Detect the next hotkey pressed by the user and translates it into a hotkey string definition
 * @param {Boolean} [includeKeydownEvent] determine whether to listen to hotkeys from keydown events
 * @returns {Promise<string>} promise that will be resolved with the hotkey
 */
function getNextHotkey (includeKeydownEvent) {
	_includingKeydownEvent = includeKeydownEvent;
	if (_pendingPromise)
		return _pendingPromise;

	let promise = new Promise((resolve, reject) => {
		_promiseResolve = resolve;
	}).then(function (hotkeyStr) {
		_pendingPromise = null;
		_promiseResolve = null;
		return hotkeyStr;
	});

	_pendingPromise = promise;
	return promise;
}

/**
 * Handle pressed keys and check if they are hotkeys
 * @param {any} event user input event
 * @param {boolean} isDown true if the input was detected by a keydown event listener
 */
function handleKeys (event, isDown) {
	if (_promiseResolve && (!isDown || _includingKeydownEvent))
		_promiseResolve(_toHotkeyStr(event));

	for (let hotkey of _registeredHotkeys) {
		if (isDown && !hotkey.useKeyDown) continue;

		let activated = false;
		if (hotkey.hotkeys) {
			for (let key of hotkey.hotkeys) {
				if (_testHotkey(key, event)) {
					activated = true;
					break;
				}
			}
		} else {
			activated = _testHotkey(hotkey, event);
		}

		if (activated)
			hotkey.callback(hotkey.hotkeyStr);
	}

	if (!isDown)
		_handleInputs(event);
}

// Handle keyspress event
iohook.on("keypress", event => {
	handleKeys(event, false);
});

// Handle keysdown event
iohook.on("keydown", event => {
	handleKeys(event, true);
});

// Start listening for keys pressed
iohook.start();

module.exports = {
	on: registerHotkey,
	remove: removeHotkey,
	getNextHotkey,
	debounce,
	get iohook () {
		return iohook;
	},
	logRegisteredHotkeys: () => {
		console.log(JSON.stringify(_registeredHotkeys, null, "	"));
	}
};
