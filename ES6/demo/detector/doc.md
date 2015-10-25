# detector

Client information detector, for auto detect user agent, include:
1.Device.
2.Operation System (OS).
3.Browser.
4.Rendering Engine.

Detected information data structure like:

```
detector = {
    device: {
        name: "iphone",
        version: -1,
        fullVersion: "-1",
        [iphone]: -1
    },
    os: {
        name: "ios",
        version: 6.1,
        fullVersion: "6.1",
        [ios]: 6.1
    },
    browser: {
        name: "chrome":
        version: 26.0,
        fullVersion: "26.0.1410.50",
        mode: 26.0,
        fullMode: "26.0.1410.50",
        compatible: false,
        [chrome]: 26.0
    },
    engine: {
        name: "webkit",
        version: 536.26,
        fullVersion: "536.26",
        mode: 523.26,
        fullMode: "523.26",
        compatible: false,
        [webkit]: 536.26
    }
}
```

Note: Above [iphone], [ios], [chrome], [webkit] is dynamically from actual environment, different device, operation system, browser and rendering engine is different.

Note:

This version of detector's code is follow CommonJS sepcification, and support NodeJS and Web Browser environment at the same time.
Some times, you just need simple detect a litter information, please reference to #18, without detector.


###Usage
```
import detector from 'detector/index.js';

// Detect browser name.
detector.browser.name === "chrome" // true

// An other example for detect browser name.
!!detector.browser.ie // false

// Detect the old browseres.
if(detector.browser.ie && detector.browser.version < 8){
    alert("You browser is too old.");
}

// Detect rendering engine below Trident 4 (IE8).
if(detector.engine.trident && detector.engine.mode < 4){
    // hack code.
}

// Collect client detail informations.
detector.browser.name + "/" + detector.browser.fullVersion;

```

###API
[api](http://docs.spmjs.io/detector/latest/)


