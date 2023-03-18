'use strict';
;
class UtilityWheel {
    #sectionsTarget;
    #sectionsContent;
    callbacks = {};
    #eventCounter = 0;
    #events = {
        invoke: {},
        hide: {},
        pointerUp: {},
    };
    invokeButton;
    element;
    constructor(element, { target = window, invokeButton = 2 } = {}) {
        this.element = element;
        this.invokeButton = invokeButton;
        this.#sectionsTarget = {
            top: element.querySelector('.uw-section-target.uw-top'),
            right: element.querySelector('.uw-section-target.uw-right'),
            bottom: element.querySelector('.uw-section-target.uw-bottom'),
            left: element.querySelector('.uw-section-target.uw-left'),
        };
        this.#sectionsContent = {
            top: element.querySelector('.uw-section-content.uw-top'),
            right: element.querySelector('.uw-section-content.uw-right'),
            bottom: element.querySelector('.uw-section-content.uw-bottom'),
            left: element.querySelector('.uw-section-content.uw-left'),
        };
        this.pointerDown = this.pointerDown.bind(this);
        this.pointerUp = this.pointerUp.bind(this);
        this.preventContextMenu = this.preventContextMenu.bind(this);
        // @ts-ignore
        target.addEventListener('pointerdown', this.pointerDown);
        // @ts-ignore
        target.addEventListener('contextmenu', this.preventContextMenu);
        for (const [side, section] of Object.entries(this.#sectionsTarget)) {
            section.addEventListener('pointerup', this.sectionUp.bind(this, side));
        }
    }
    // ---- Methods ----
    setSection(side, node, callback) {
        this.#sectionsContent[side].replaceChildren(node);
        this.callbacks[side] = callback;
    }
    // ---- Visibility handling ----
    invoke(x, y) {
        this.element.classList.remove('uw-hidden');
        this.element.style.transform = `translate(${x}px, ${y}px)`;
        this.invokeEvent('invoke');
    }
    hide() {
        this.element.classList.add('uw-hidden');
        this.invokeEvent('hide');
    }
    // ---- Event handling ----
    addEvent(type, callback) {
        this.#events[type][this.#eventCounter++] = callback;
        return this.#eventCounter - 1;
    }
    removeEvent(index) {
        for (const events of Object.values(this.#events)) {
            delete events[index];
        }
    }
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
            this.invoke(e.clientX, e.clientY);
        }
    }
    pointerUp(e) {
        window.removeEventListener('pointerup', this.pointerUp);
        this.hide();
        this.invokeEvent('pointerUp', e);
    }
    sectionUp(side) {
        this.callbacks[side]?.();
    }
}
