'use strict';
;
class UtilityWheel {
    sectionsTarget;
    sectionsContent;
    callbacks = {};
    #eventCounter = 0;
    #events = {
        invoke: {},
        hide: {},
        pointerUp: {},
    };
    invokeButton;
    target;
    element;
    /**
     * @param element The DOM element of the base utility wheel structure.
     *                See the provided HTML template in html/
     */
    constructor(element, { target = window, invokeButton = 2 } = {}) {
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
        this.pointerDown = this.pointerDown.bind(this);
        this.pointerUp = this.pointerUp.bind(this);
        this.preventContextMenu = this.preventContextMenu.bind(this);
        this.keyDown = this.keyDown.bind(this);
        this.element.querySelector('.uw-circle-indicator')
            .addEventListener('contextmenu', this.preventContextMenu);
        for (const [side, section] of Object.entries(this.sectionsTarget)) {
            section.addEventListener('pointerup', this.sectionUp.bind(this, side));
        }
        this.enable();
    }
    // ---- Methods ----
    /**
     * Sets a section's DOM content and callback.
     * @param side Which side to set.
     * @param element The DOM content that will be added into the specific `.uw-section-content`.
     * @param callback Is called when a section is invoked.
     */
    setSection(side, element, callback) {
        this.setSectionContent(side, element);
        this.setSectionCallback(side, callback);
    }
    setSectionContent(side, element) {
        this.sectionsContent[side].replaceChildren(element);
    }
    setSectionCallback(side, callback) {
        this.callbacks[side] = callback;
    }
    /**
     * Enables the DOM events for mouse invokation.
     * Is called automatically in the constructor.
     * @see the counterpart {@link disable}
     */
    enable() {
        this.target.addEventListener('pointerdown', this.pointerDown);
        this.target.addEventListener('contextmenu', this.preventContextMenu);
    }
    /**
     * Disables the DOM events for mouse invokation.
     * @see the counterpart {@link enable}
     */
    disable() {
        this.target.removeEventListener('pointerdown', this.pointerDown);
        this.target.removeEventListener('contextmenu', this.preventContextMenu);
    }
    // ---- Visibility handling ----
    /**
     * Manually invokes the utility wheel's visibility at the given coordinates.
     * Invokes the 'invoke' event.
     */
    invoke(x, y) {
        this.element.classList.remove('uw-hidden');
        this.element.style.transform = `translate(${x}px, ${y}px)`;
        this.invokeEvent('invoke');
    }
    /**
     * Manually hides the utility wheel from the DOM.
     * Invokes the 'hide' event.
     */
    hide() {
        this.element.classList.add('uw-hidden');
        this.invokeEvent('hide');
    }
    // ---- Event handling ----
    /**
     * Adds a custom event listener from the {@link EventType} selection.
     * Returns a unique identifier that can be used to remove the event
     * in {@link removeEvent}.
     * @return An event identifier that can be used to remove it.
     */
    addEvent(type, callback) {
        this.#events[type][this.#eventCounter++] = callback;
        return this.#eventCounter - 1;
    }
    /**
     * Removes a custom event by its unique identifier.
     * @see {@link addEvent}.
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
     * Invokes all registered events of a given type with custom arguments.
     * Probably not useful on its own, just a helper function.
     * @see {@link EventType}.
     */
    invokeEvent(type, ...args) {
        for (const callback of Object.values(this.#events[type])) {
            callback(...args);
        }
    }
    // ---- Events ----
    preventContextMenu(e) {
        if (e.button === this.invokeButton) {
            e.preventDefault();
        }
    }
    pointerDown(e) {
        if (e.button === this.invokeButton) {
            window.addEventListener('pointerup', this.pointerUp);
            window.addEventListener('keydown', this.keyDown);
            this.invoke(e.clientX, e.clientY);
        }
    }
    pointerUp(e) {
        this.#hideAndRemoveEvents();
        this.invokeEvent('pointerUp', e);
    }
    keyDown(e) {
        if (e.key === 'Escape') {
            this.#hideAndRemoveEvents();
        }
    }
    sectionUp(side, e) {
        this.callbacks[side]?.(e);
    }
    // ---- Event helpers ----
    #hideAndRemoveEvents() {
        window.removeEventListener('pointerup', this.pointerUp);
        window.removeEventListener('keydown', this.keyDown);
        this.hide();
    }
}
