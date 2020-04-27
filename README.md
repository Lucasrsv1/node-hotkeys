# Node Hotkeys
Handle hotkeys on NodeJS easily.

## Usage
### Registering hotkeys
#### Simple use
```javascript
const hotkeys = require('hotkeys');

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

#### Multiple hotkeys
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

#### Triggering multiple hotkeys
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

#### Matching only the required modifiers
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

#### Matching capitalization
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

If you have capslock disabled and press ctrl + a, the output will be:
```
Activated: ctrl + a
```

If you have capslock disabled and press ctrl + shift + a, the output will be:
```
Activated: ctrl + A
```

If you have capslock enabled and press ctrl + a, the output will be:
```
Activated: ctrl + A
```

And if you have capslock enabled and press ctrl + shift + a, the output will be:
```
Activated: ctrl + a
```

#### Special cases
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

#### Split key
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

### Removing hotkeys
The following method has support to the same options of the method `on()` used to register the hotkeys.
```javascript
hotkeys.remove({ hotkeys: "ctrl + a" });
```
PS: when removing hotkeys all modifiers will always be checked and only if they match that the hotkey will be removed. So `matchAllModifiers` is automatically set `true`.

### Access the IOHook instance
```javascript
hotkeys.iohook
```

### Debug hotkeys being used
#### Example of use:
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

#### Output:
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
