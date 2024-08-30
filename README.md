# UtilityWheel
A customizable utility wheel with four sections for your website.
It is a more sophisticated version of
[this pen](https://codepen.io/Maluscat/full/QWBWbWw) and can be seen in action
in [Scratchet](https://scratchet.malus.zone/).

This library also provides a class that lets a user reassign the utility wheel
using drag and drop. See [here](#UtilityWheelUIConfig) for an overview and
[Scratchet](https://scratchet.malus.zone/)'s settings for a demonstration.


## Installation
UtilityWheel isn't on any package manager. It has a rolling release model, which
means that you can always fetch the files from the `main` branch of this repository.

### Download
Download the required JavaScript and CSS files from [`./script`](./script)
and [`./style`](./style) respectively and include them into your project.

If you want type checking, you'll need to fetch the TypeScript files in `./script` as well.

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
### Prerequisites
UtilityWheel does not build its DOM for you. You will need to include or build
it manually. See the [provided snippet](./html/snippet.html) for the required
HTML structure. This snippet can be used with any template engine for easy inclusion.

It is also pretty safe to just copy and paste the snippet into your document.
The library is stable at this point and the DOM structure is unlikely to be
changed in the foreseeable future. 


### Constructor & methods
Instantiate the provided `UtilityWheel` class with the DOM element of its
HTML structure (see above).
```js
const node = document.querySelector('.utility-wheel');
const utilWheel = new UtilityWheel(node);
```

You can also provide options (here with the defaults):
```js
const utilWheel = new UtilityWheel(node, {
  enable: true,
  target: window,
  invokeButton: 2
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
a user has dropped onto a static utility wheel. You can see it in action in
[Scratchet](https://scratchet.malus.zone/)'s settings panel.

The class is a superclass of `UtilityWheel`, so it is instantiated and acts
like a normal utility wheel. The configuration argument thereby also extends
`UtilityWheel`'s configuration, but it does require two additional options:
- `actionList` is a list of available actions that can be assigned to a section
  of the utility wheel, containing a callback and element (onto which all
  drag and drop events are added).
- `configContainer` is a DOM Element into which the static utility wheel
  (which is the drop target and which differs from the underlying, real utility
  wheel) is appended.

*Important*: The supplied actions' elements, which the user will be able to
drop onto the static utility wheel, are not added to the DOM automatically.

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
const configContainer = /* DOM target for the static utility wheel */;

const utilWheel = new UtilityWheelUIConfig(node, {
  actionList,
  configContainer
  // + All optional config options of `UtilityWheel` (see above)
});

// Add the elements somewhere to the DOM so that they are exposed for dragging
for (const { element } of actionList) {
  document.body.appendChild(element);
}
```

Additionally, there are a lot of custom events available that expose all possible
invoked drag and drop events. See the [docs](#docs) for more info.


## Docs
Overview: [UtilityWheel](https://docs.malus.zone/utility-wheel/#UtilityWheel.UtilityWheel)
- [Configuration](https://docs.malus.zone/utility-wheel/#UtilityWheel.Config)
- [Events](https://docs.malus.zone/utility-wheel/#UtilityWheel.Events)

Overview: [UtilityWheelUIConfig](https://docs.malus.zone/utility-wheel/#UtilityWheelUIConfig.UtilityWheelUIConfig)
- [Configuration](https://docs.malus.zone/utility-wheel/#UtilityWheelUIConfig.Config)
- [Events](https://docs.malus.zone/utility-wheel/#UtilityWheelUIConfig.UIEvents)


## Styling
Take a look at the [Less](./style/less) files for an overview of the styling.

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
}
```
