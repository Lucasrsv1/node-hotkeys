# Node Hotkeys #
Handle hotkeys on NodeJS easily.

## Registering hotkeys ##
### Simple use ###
```javascript
const hotkeys = require('node-hotkeys');

hotkeys.on({
	hotkeys: 'ctrl + a',
	matchAllModifiers: true,
	callback: function (hotkey) {
		console.log("Activated:", hotkey);
	}
});
```

If ctrl + a is pressed, the output will be:
```
Activated: ctrl + a
```

### Multiple hotkeys ###
Separate the hotkeys using comma:
```javascript
hotkeys.on({
	hotkeys: 'alt + a, shift + a, ctrl + a',
	matchAllModifiers: true,
	callback: function (hotkey) {
		console.log("Activated:", hotkey);
	}
});
```

If any of the registered hotkeys are pressed, the output will be:
```
Activated: alt + a, shift + a, ctrl + a
```

### Triggering multiple hotkeys ###
By adding the option `triggerAll` we can call the callback function for each of the hotkeys pressed:
```javascript
hotkeys.on({
	hotkeys: 'alt + a, shift + a, ctrl + a',
	matchAllModifiers: true,
	triggerAll: true,
	callback: function (hotkey) {
		console.log("Activated:", hotkey);
	}
});
```

If shift + a is pressed and then alt + a, the output will be:
```
Activated: shift + a
Activated: alt + a
```

### Matching only the required modifiers ###
If we set `matchAllModifiers` to `false` then we'll be able to detect hotkeys that may have been pressed accompanied by other modifiers:
```javascript
hotkeys.on({
	hotkeys: 'ctrl + a, a',
	matchAllModifiers: false,
	triggerAll: true,
	callback: function (hotkey) {
		console.log("Activated:", hotkey);
	}
});
```

If ctrl + a is pressed, the output will be:
```
Activated: ctrl + a
Activated: a
```

And if shift + a is pressed, the output will be:
```
Activated: a
```

PS: the modifiers are `alt`, `shift` and `ctrl`.

### Matching capitalization ###
If you would like to differentiate uppercase and lowercase letters, add the `capitalization` option:
```javascript
hotkeys.on({
	hotkeys: 'ctrl + a, ctrl + A',
	capitalization: true,
	triggerAll: true,
	callback: function (hotkey) {
		console.log("Activated:", hotkey);
	}
});
```

If you have caps lock disabled and press ctrl + a, the output will be:
```
Activated: ctrl + a
```

If you have caps lock disabled and press ctrl + shift + a, the output will be:
```
Activated: ctrl + A
```

If you have caps lock enabled and press ctrl + a, the output will be:
```
Activated: ctrl + A
```

And if you have caps lock enabled and press ctrl + shift + a, the output will be:
```
Activated: ctrl + a
```

### Special cases ###
```javascript
hotkeys.on({
	hotkeys: 'shift + plus, enter, space, tab, esc, backspace',
	triggerAll: true,
	callback: function (hotkey) {
		console.log("Activated:", hotkey);
	}
});
```

If we press those keys in that order, the output will be:
```
Activated: shift + plus
Activated: enter
Activated: space
Activated: tab
Activated: esc
Activated: backspace
```

### Detecting special keys ###
Some keys do not have a character representation, thus they can only be detected using `keydown` events, which you can turn on by setting the option `useKeyDown` to `true`:
```javascript
hotkeys.on({
	hotkeys: 'left, up, right, down',
	matchAllModifiers: true,
	triggerAll: true,
	useKeyDown: true,
	callback: function (hotkey) {
		console.log("Arrow:", hotkey);
	}
});
```

If we press those keys in that order, the output will be:
```
Arrow: left
Arrow: up
Arrow: right
Arrow: down
```

Other special keys: `capslock`, `pgup`, `pgdn`, `end`, `home`, `prtsc`, `insert`, `delete`, `cmd`, `F1`, `F2`, `F3`, `F4`, `F5`, `F6`, `F7`, `F8`, `F9`, `F10`, `F11`, `F12`.


### Split key ###
The split key is used to combine keys in order to define the hotkey, the default split key is `+`. But it can be changed using the `splitKey` option:
```javascript
hotkeys.on({
	hotkeys: 'shift - +',
	splitKey: '-',
	callback: function (hotkey) {
		console.log("Activated:", hotkey);
	}
});
```

If we press shift and +, the output will be:
```
Activated: shift - +
```

## Removing hotkeys ##
The following method has support to the same options of the method `on()` used to register the hotkeys.
```javascript
hotkeys.remove({ hotkeys: "ctrl + a" });
```
PS: when removing hotkeys all modifiers will always be checked and only if they match that the hotkey will be removed. So `matchAllModifiers` is automatically set `true`.

## Detecting any hotkeys ##
It is also possible to detect what combination of keys the user pressed by using the method `getNextHotkey`:
```javascript
(async () => {
	while (true) {
		let hotkeyStr = await hotkeys.getNextHotkey(false);
		console.log("Detected:", hotkeyStr);
	}
})();
```

The code above prints in the console every hotkey pressed by the user, it can be used, for instance, when asking for the user to choose a custom hotkey. The method `getNextHotkey` receives a `boolean` parameter that determines whether to listen to hotkeys from `keydown` events (when `true`) or only `keypress` events (when `false`). It also returns a `Promise` that will be resolved with the hotkey string definition that the user chose. So if you press alt + shift + y with caps lock disabled, the output will be:
```
Detected: alt + shift + Y
```

## Access the IOHook instance ##
```javascript
hotkeys.iohook
```
More information about IOHook on [this link](https://github.com/wilix-team/iohook).

## Debug hotkeys being used ##
### Example of use: ###
```javascript
hotkeys.on({
	hotkeys: 'alt + a, shift + a',
	matchAllModifiers: true,
	triggerAll: true,
	callback: function (hotkey) { }
});

hotkeys.on({
	hotkeys: 'ctrl + h, H',
	capitalization: true,
	callback: function (hotkey) { }
});

hotkeys.logRegisteredHotkeys();
```

### Output: ###
```JSON
[{
	"hotkeyStr": "alt + a",
	"shiftKey": false,
	"altKey": true,
	"ctrlKey": false,
	"matchAllModifiers": true,
	"rawcode": 65
}, {
	"hotkeyStr": "shift + a",
	"shiftKey": true,
	"altKey": false,
	"ctrlKey": false,
	"matchAllModifiers": true,
	"rawcode": 65
}, {
	"hotkeys": [{
		"hotkeyStr": "ctrl + h",
		"shiftKey": false,
		"altKey": false,
		"ctrlKey": true,
		"matchAllModifiers": false,      
		"keychar": 104
	}, {
		"hotkeyStr": "H",
		"shiftKey": false,
		"altKey": false,
		"ctrlKey": false,
		"matchAllModifiers": false,
		"keychar": 72
	}],
	"hotkeyStr": "ctrl + h, H"
}]
```

## Using Debounce Listeners ##
The `debounce` method can register a callback to be called whenever the user presses keys or types some text. You must define a debounce time in milliseconds and the callback that will receive the content typed as a string and the `KeypressEvent`s array with each key pressed. The string returned by this method is a key that identifies the registered debounce listener so that you can remove it later using `removeDebounce`.

### Definition: ###
```typescript
debounce (ms: number, callback: (string, KeypressEvent[]) => void): string
```

### Example of use: ###
```javascript
const hotkeys = require('node-hotkeys');

const key = hotkeys.debounce(500, (value, events) => {
	console.log("INPUT:", value);
});
```

### Removing debounce listeners: ###
```javascript
hotkeys.removeDebounce(key);
```
