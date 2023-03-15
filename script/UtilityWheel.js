'use strict';
;
class UtilityWheel {
    #sectionsTarget;
    #sectionsContent;
    callbacks = {};
    invokeButton;
    element;
    constructor(element, { target = window, invokeButton = 2 } = {}) {
        this.element = element;
        this.invokeButton = invokeButton;
        this.#sectionsTarget = {
            top: element.querySelector('.section-target.top'),
            right: element.querySelector('.section-target.right'),
            bottom: element.querySelector('.section-target.bottom'),
            left: element.querySelector('.section-target.left'),
        };
        this.#sectionsContent = {
            top: element.querySelector('.section-content.top'),
            right: element.querySelector('.section-content.right'),
            bottom: element.querySelector('.section-content.bottom'),
            left: element.querySelector('.section-content.left'),
        };
        this.pointerDown = this.pointerDown.bind(this);
        this.invoke = this.invoke.bind(this);
        this.hide = this.hide.bind(this);
        // @ts-ignore
        target.addEventListener('pointerdown', this.pointerDown);
        target.addEventListener('pointerup', this.hide);
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
        this.element.classList.remove('hidden');
        this.element.style.transform = `translate(${x}px, ${y}px)`;
    }
    hide() {
        this.element.classList.add('hidden');
    }
    // ---- Events ----
    pointerDown(e) {
        if (e.button === this.invokeButton) {
            this.invoke(e.clientX, e.clientY);
        }
    }
    sectionUp(side) {
        this.callbacks[side]?.();
    }
}
