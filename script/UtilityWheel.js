'use strict';
;
/** Simple drop-in, configurable utility wheel for front-end use. */
export class UtilityWheel {
    /**
     * List of the DOM elements that serve as the mouse targets
     * of the utility wheel's four sections.
     */
    sectionsTarget;
    /**
     * List of the DOM elements that hold the content
     * of the utility wheel's four sections.
     */
    sectionsContent;
    callbacks = {};
    #eventCounter = 0;
    #events = {
        invoke: {},
        hide: {},
        pointerUp: {},
    };
    /** @see {@link Config.invokeButton} */
    invokeButton;
    /** @see {@link Config.target} */
    target;
    /** The utility wheel DOM element. */
    element;
    /**
     * @param element The DOM element of the base utility wheel structure.
     *                See the provided HTML template in the `html/` folder.
     */
    constructor(element, { target = window, invokeButton = 2, enable = true } = {}) {
        this.target = target;
        this.element = element;
        this.invokeButton = invokeButton;
        this.sectionsTarget = {
            top: element.querySelector('.uw-section-target.uw-top'),
            right: element.querySelector('.uw-section-target.uw-right'),
            bottom: element.querySelector('.uw-section-target.uw-bottom'),
            left: element.querySelector('.uw-section-target.uw-left'),
        };
        this.sectionsContent = {
            top: element.querySelector('.uw-section-content.uw-top'),
            right: element.querySelector('.uw-section-content.uw-right'),
            bottom: element.querySelector('.uw-section-content.uw-bottom'),
            left: element.querySelector('.uw-section-content.uw-left'),
        };
        this._pointerDown = this._pointerDown.bind(this);
        this._pointerUp = this._pointerUp.bind(this);
        this._preventContextMenu = this._preventContextMenu.bind(this);
        this._keyDown = this._keyDown.bind(this);
        this.element.querySelector('.uw-circle-indicator')
            .addEventListener('contextmenu', this._preventContextMenu);
        for (const [side, section] of Object.entries(this.sectionsTarget)) {
            section.addEventListener('pointerup', this._sectionUp.bind(this, side));
        }
        if (enable)
            this.enable();
    }
    // ---- Methods ----
    /**
     * Set a section's DOM content and callback.
     * @param side Which side to set.
     * @param element The DOM content that will be added into the specific `.uw-section-content`.
     * @param callback Is called when the section is invoked.
     */
    setSection(side, element, callback) {
        this.setSectionContent(side, element);
        this.setSectionCallback(side, callback);
    }
    /**
     * Set only the content of one of the four sections.
     * @param side Which side to set.
     * @param element The HTML element that should be added into the section.
     */
    setSectionContent(side, element) {
        this.sectionsContent[side].replaceChildren(element);
    }
    /**
     * Set only the callback of one of the four sections.
     * @param side Which side to set.
     * @param callback The callback that is called when the section is invoked.
     */
    setSectionCallback(side, callback) {
        this.callbacks[side] = callback;
    }
    /**
     * Enable the DOM events needed for mouse invokation.
     * Is called automatically in the constructor.
     */
    enable() {
        this.target.addEventListener('pointerdown', this._pointerDown);
        this.target.addEventListener('contextmenu', this._preventContextMenu);
    }
    /** Remove the DOM events needed for mouse invokation.  */
    disable() {
        this.target.removeEventListener('pointerdown', this._pointerDown);
        this.target.removeEventListener('contextmenu', this._preventContextMenu);
    }
    // ---- Visibility handling ----
    /**
     * Manually invoke the utility wheel's visibility at the given coordinates.
     * Invokes the 'invoke' event.
     */
    invoke(x, y) {
        this.element.classList.remove('uw-hidden');
        this.element.style.transform = `translate(${x}px, ${y}px)`;
        this.invokeEvent('invoke');
    }
    /**
     * Manually hide the utility wheel from the DOM.
     * Invokes the 'hide' event.
     */
    hide() {
        this.element.classList.add('uw-hidden');
        this.invokeEvent('hide');
    }
    // ---- Event handling ----
    /**
     * Add a custom event listener from the available event types.
     * Returns a unique identifier that can be passed to {@link removeEvent}.
     *
     * @returns An identifier that can be used to remove the event in {@link removeEvent}.
     * @see {@link EventData}
     */
    addEvent(type, callback) {
        this.#events[type][this.#eventCounter++] = callback;
        return this.#eventCounter - 1;
    }
    /**
     * Remove an event previously added with {@link addEvent}.
     *
     * Takes one of three possible arguments:
     * - An event identifier returned by {@link addEvent}.
     * - An event name (removes everything under the event name, e.g. 'pointerUp').
     * - A callback (removes every event that has the callback attached).
     *
     * @param key Either an event ID, an event name or a callback.
     */
    removeEvent(key) {
        if (typeof key === 'string') {
            this.#events[key] = {};
        }
        else {
            for (const events of Object.values(this.#events)) {
                if (typeof key === 'number') {
                    delete events[key];
                }
                else {
                    for (const [index, fun] of Object.entries(events)) {
                        if (fun === key) {
                            delete events[index];
                        }
                    }
                }
            }
        }
    }
    /**
     * Manually invoke an event from the available event types with matching arguments.
     * @see {@link EventData}
     */
    invokeEvent(type, ...args) {
        for (const callback of Object.values(this.#events[type])) {
            callback(...args);
        }
    }
    // ---- Events ----
    /**
     * `'context'` event handler to prevent context menu popup on click.
     * @internal
     */
    _preventContextMenu(e) {
        if (e.button === this.invokeButton) {
            e.preventDefault();
        }
    }
    /** @internal */
    _pointerDown(e) {
        if (e.button === this.invokeButton) {
            window.addEventListener('pointerup', this._pointerUp);
            window.addEventListener('keydown', this._keyDown);
            this.invoke(e.clientX, e.clientY);
        }
    }
    /** @internal */
    _pointerUp(e) {
        this.#hideAndRemoveEvents();
        this.invokeEvent('pointerUp', e);
    }
    /** @internal */
    _keyDown(e) {
        if (e.key === 'Escape') {
            this.#hideAndRemoveEvents();
        }
    }
    /** @internal */
    _sectionUp(side, e) {
        this.callbacks[side]?.(e);
    }
    // ---- Event helpers ----
    /** Hide the utility wheel and remove all temporary window events. */
    #hideAndRemoveEvents() {
        window.removeEventListener('pointerup', this._pointerUp);
        window.removeEventListener('keydown', this._keyDown);
        this.hide();
    }
}
