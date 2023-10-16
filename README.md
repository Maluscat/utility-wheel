# UtilityWheel
A customizable utility wheel for your website.
It is a more sophisticated version of [this pen](https://codepen.io/Hallo89/full/QWBWbWw). Check it out to see it in action!

## Installation
UtilityWheel isn't on any package manager. It has a rolling release model, which means that you can always fetch the files from the `main` branch of this repository.

### Download
Download the single required JavaScript and CSS file from [`./script`](https://gitlab.com/Hallo89/utility-wheel/-/blob/main/script) and [`./style`](https://gitlab.com/Hallo89/utility-wheel/-/blob/main/style) respectively and include them into your project.

If you want type checking, you'll need to fetch the TypeScript file in `./script` as well.

For the sake of denoting which version of the files you loaded, you can use the commit hash, e.g. include it in the file names.

### Git submodules
If your project is a Git repository already, you can easily use [submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules), which is a powerful tool capable of replacing a package manager for simple projects. That way, you can pin this repo to a specific commit and only update when you're ready.

Setup:
```sh
cd ./path/to/your/repo
git submodule add https://gitlab.com/Hallo89/utility-wheel.git
```

Update (this will just fast-forward to the latest commit on `main`):
```sh
git submodule update --remote
```

The required files are in `./script` (TS/JS) and `./style` (CSS).

## Getting started
### Prerequisites
UtilityWheel does not build its DOM for you. You will need to include – or build – it manually.
See [the provided snippet](https://gitlab.com/Hallo89/utility-wheel/-/blob/main/html/snippet.html) for the needed HTML structure. The snippet can be used with any template engine for easy inclusion.

If you pin the version of this project you can also just copy-paste it into your file.

### Constructor
Instantiate the provided `UtilityWheel` class with the DOM element of the its HTML structure (see above).
```js
const node = document.querySelector('.utility-wheel');
const utilWheel = new UtilityWheel(node);
```

You can also provide options (here with the defaults):
```js
const utilWheel = new UtilityWheel(node, {
  target: window,
  invokeButton: 2
});
```

## Options
Please note that there are not nearly enough options yet.

<dl>
  <dt>target</dt>
  <dd>
    The DOM element the DOM events (namely `pointerdown`) will get registered onto.
    *type*: `EventTarget` (basically any DOM element)
    *default*: `window`
  </dd>
  <dt>invokeButton</dt>
  <dd>
    A [`MouseEvent.button` value](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button) that specifies which button invokes the utility wheel on click.
    *type*: `number`
    *default*: `2` (right click)
  </dd>
</dl>

See the [`ConfigOptions` interface](https://gitlab.com/Hallo89/utility-wheel/-/blob/main/script/UtilityWheel.ts#L2) for a full overview of configuration options.

## Methods
Here are some useful methods with a brief description. See the [main file](https://gitlab.com/Hallo89/utility-wheel/-/blob/main/script/UtilityWheel.ts) for a full overview of available methods along with their types & arguments (I'm too lazy to generate a documentation (；⌣̀_⌣́)). Methods that don't have a (comprehensive) doc comment are probably not interesting for manual use!
- `setSection`: Set DOM content & callback of one of the four sections (`top`, `bottom`, `left`, `right`).
- `enable`: Enable the DOM events, namely `pointerdown`. Is called automatically in the constructor.
- `disable`: Disable the DOM events again.
- `invoke`: Invoke the utility wheel at the given coordinates.
- `hide`: Hide the utility wheel.
- `addEvent`: Add an event listener for the builtin custom events.
- `removeEvent`: Remove an event listener again.

## Events
There are some custom events available that are registered with `addEvent` and removed again with `removeEvent` (see above).

Available event types are:
<dl>
  <dt>invoke</dt>
  <dd>
    Fires when the utility wheel is invoked (made visible in the DOM) by any means.
    *arguments*: none
  </dd>
  <dt>hide</dt>
  <dd>
    Fires when the utility wheel is hidden from the DOM by any means.
    *arguments*: none
  </dd>
  <dt>pointerUp</dt>
  <dd>
    Fires when the pointer, that has activated the utility wheel, releases (shortly before the utility wheel is being hidden).
    *arguments*: `PointerEvent`
  </dd>
</dl>

## Styling
Take a look at the [LESS](https://gitlab.com/Hallo89/utility-wheel/-/tree/main/style/less) files for an overview of the styles.

### CSS Variables
There are some CSS variables available which should cover most of the basic styling requirements:
```less
--utilWheel-center-color: hsl(0, 0%, 8%);
--utilWheel-border-color: hsl(0, 0%, 44%);
--utilWheel-section-color: hsl(0, 0%, 19%);

// Determines the size of the unclickable center area
--utilWheel-center-size: 6em;
// Determines the size of the clickable & hoverable content as a whole
--utilWheel-wheel-size: 27em;
// Determines the gradient fall off of the sections
--utilWheel-gradient-stop: 21em;
```
