# UtilityWheel
A customizable utility wheel with four sections for your website.
It is a more sophisticated version of
[this pen](https://codepen.io/Maluscat/full/QWBWbWw) and can be seen in action
in [Scratchet](https://scratchet.malus.zone/).

This library also provides a class that lets a user reassign the utility wheel
using drag and drop. See [here](#utilitywheeluiconfig) for an overview and
[Scratchet](https://scratchet.malus.zone/)'s settings for a demonstration.


## Installation
Since I don't have much more to add to this library, there won't be many more
updates in the future.
However, if you have feedback or any ideas for improvement, consider opening
an issue or pull request!

### Download
Download the required JavaScript and CSS files from [`./script`](./script)
and [`./style`](./style) respectively and include them into your project.
Every JavaScript file comes with a respective TypeScript file that can be used
for type checking.

### Package manager
This library isn't on any package manager, but you can use your favorite package
manager's *Git resolution strategy* ([Yarn](https://yarnpkg.com/cli/add),
[npm](https://docs.npmjs.com/cli/v6/commands/npm-install)) to import it.

### Git submodules
If your project is a Git repository already, you can easily use
[Git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules), which is
capable of replacing a package manager for simple projects. That way, you can pin
this repo to a specific commit and only update it when you're ready.

Setup:
```sh
cd ./path/to/repo/target
git submodule add https://gitlab.com/Maluscat/utility-wheel.git
```

Update (this will fetch the latest commit of `main`):
```sh
git submodule update --remote
```

The required files are in `./script` (TS/JS) and `./style` (CSS).


## Getting started
Instantiate the provided `UtilityWheel` class with the DOM element that the
utility wheel element should be appended into (can also be fully replaced).
```js
const target = document.querySelector('.utility-wheel-container');
const utilWheel = new UtilityWheel(target);
```

You can also provide options (here with the defaults):
```js
const utilWheel = new UtilityWheel(target, {
  enable: true, // Enable the utility wheel by default
  target: window, // Pointer event target
  replace: false, // Replace given container with utility wheel instead of appending
  invokeButton: 2 // Mouse button that invokes the utility wheel
});
```

Then, you can assign the four sections:
```js
// Create any HTML element that will be displayed in the section:
const leftSideElement = document.createTextNode('Content!');
utilWheel.setSection('left', leftSideElement, () => {
  console.log('The user invoked the left section');
});
// Do this for all other sides...
```

Afterwards, you can add events or control the utility wheel manually,
for example:
```js
utilWheel.addEvent('invoke', () => {
  console.log("Utility wheel has been invoked!");
});
```
See the [docs](#docs) for a complete overview.


## UtilityWheelUIConfig
The available class `UtilityWheelUIConfig` provides a very simple way to
setup a front end configuration of a utility wheel using drag and drop.
It automatically reassigns the underlying utility wheel with an action that
a user has dropped onto a static utility wheel ("configuration wheel").
You can see it in action in [Scratchet](https://scratchet.malus.zone/)'s
settings panel.

The class is a superclass of `UtilityWheel`, so it is instantiated and acts
like a normal utility wheel. The configuration argument thereby also extends
`UtilityWheel`'s configuration, but it does require two additional options:
- `actionList` is an array of available actions that can be assigned to a
  section of the utility wheel, containing a callback and element (onto which
  all drag and drop events are added).
- `configContainer` is a DOM Element into which the static utility wheel
  (which is the drop target and which differs from the underlying, real utility
  wheel) is appended.

*Important*: The supplied actions' elements, which the user will be able to
drop onto the static utility wheel, are **not** added to the DOM by the library.

```js
const actionList = [
  {
    element: document.createTextContent('action 1'),
    callback: () => { console.log("Action 1 has been invoked!") }
  }, {
    element: document.createTextContent('action 2'),
    callback: () => { console.log("Action 2 has been invoked!") }
  }
];
const configContainer = document.getElementbyId('settings');

const utilWheel = new UtilityWheelUIConfig(target, {
  actionList,
  configContainer
  // + All optional config options of `UtilityWheel` (see above)
});

// Since we have just created the action elements,
// they now need to be added to the DOM manually.
// Instead, they also could have been fetched from the DOM.
for (const { element } of actionList) {
  document.body.appendChild(element);
}
```

Additionally, there are a lot of custom events available that expose all possible
invoked drag and drop events. See the [docs](#docs) for more info.

### DOM & CSS
The `UtilityWheelUIConfig` adds some useful classes to relevant elements:
- `uw-action` to all specified action elements
- `uw-dragging` to an action element that is currently being dragged
- `uw-dragover` to the configuration wheel's content and target elements
   if there is an action being dragged over their specific section
- `uw-is-dragging` to the body if an action is currently being dragged

Additionally, there are a few lines of CSS that utilize these classes and add
some simple, interactive styling to the configuration wheel and actions. This is
easily overridable and can be configured via [CSS variables](#css-variables).


## Docs
Overview: [UtilityWheel](https://docs.malus.zone/utility-wheel/#UtilityWheel.UtilityWheel)
- [Configuration](https://docs.malus.zone/utility-wheel/#UtilityWheel.Config)
- [Events](https://docs.malus.zone/utility-wheel/#UtilityWheel.Events)

Overview: [UtilityWheelUIConfig](https://docs.malus.zone/utility-wheel/#UtilityWheelUIConfig.UtilityWheelUIConfig)
- [Configuration](https://docs.malus.zone/utility-wheel/#UtilityWheelUIConfig.Config)
- [Events](https://docs.malus.zone/utility-wheel/#UtilityWheelUIConfig.UIEvents)


## Styling
You can take a look at the [Less](./style/less) files to get an overview of
the default styling. It is very minimal and can thus easily be overridden
and extended!

### CSS Variables
There are some CSS variables available which should cover most of the basic
styling requirements:
```less
:root {
  --utilWheel-center-color: hsl(0, 0%, 8%);
  --utilWheel-border-color: hsl(0, 0%, 44%);
  --utilWheel-section-color: hsl(0, 0%, 19%);
  
  // Determines the size of the unclickable center area
  --utilWheel-center-size: 6em;
  // Determines the size of the clickable & hoverable content as a whole
  --utilWheel-wheel-size: 27em;
  // Determines the gradient fall off of the sections
  --utilWheel-gradient-stop: 21em;

  // Scale of the utility wheel content when an action is dragged over it
  --utilWheel-dragover-scale: .92;
  // Opacity of both a dragged action and the uw content when an action is dragged over it
  --utilWheel-dragging-opacity: .575;
  // Scale of a dragged action
  --utilWheel-dragging-action-scale: .97;
}
```
