'use strict';
import { UtilityWheel, } from './UtilityWheel.js';
/**
 * UtilityWheel UI configuration helper.
 *
 * This library will instantiate a static utility wheel ("configuration wheel"),
 * inside the given container.
 * In the front-end, the given actions can then be dragged and dropped onto
 * the configuration wheel to automatically reassign the underlying real
 * utility wheel with the action in question.
 *
 * The DOM elements of the supplied actions will be given the relevant
 * drag and drop events. However, they must still be appended to the DOM
 * manually wherever fits your purposes. Everything else is handled by
 * this class.
 *
 * Several custom events may be registered using the {@link UtilityWheel}
 * event system which are invoked at different steps during the drag and
 * drop process. See {@link UIEvents} for all available events.
 *
 * Additionally, several classes are added to the actions and configuration
 * wheel for easy access to styling. There are also some default styles
 * available in the given CSS file.
 */
export class UtilityWheelUIConfig extends UtilityWheel {
    /** The static utility wheel instance used for the configuration. */
    configWheel;
    /** @see {@link Config.actionList} */
    actionList;
    constructor(elementTarget, config) {
        if (!config?.actionList || !config?.configContainer) {
            throw new Error('UtilityWheelUIConfig @ constructor: Both the `actionList` and `configContainer` options need to be defined.');
        }
        super(elementTarget, config);
        this.actionList = config.actionList;
        this.configWheel = new UtilityWheel(elementTarget, {
            enable: false
        });
        this.configWheel.element.classList.add('uw-configuration-wheel');
        config.configContainer.appendChild(this.configWheel.element);
        this.actionList.forEach(({ element }, i) => {
            element.draggable = true;
            element.classList.add('uw-action');
            element.addEventListener('dragstart', this.#dragStart.bind(this, i, element));
            element.addEventListener('dragend', this.#dragEnd.bind(this, i, element));
        });
        for (const [side, element] of Object.entries(this.configWheel.sectionsTarget)) {
            const contentSection = this.configWheel.sectionsContent[side];
            element.addEventListener('drop', this.#dropElement.bind(this, contentSection, side));
            element.addEventListener('dragover', this.#dragOver.bind(this, contentSection));
            element.addEventListener('dragenter', this.#dragEnter.bind(this, contentSection));
            element.addEventListener('dragleave', this.#dragLeave.bind(this, contentSection));
        }
    }
    // ---- Drag handling ----
    #dragStart(actionIndex, element, e) {
        e.dataTransfer.dropEffect = 'move';
        e.dataTransfer.effectAllowed = 'copyMove';
        e.dataTransfer.setData('text/plain', actionIndex.toString());
        e.currentTarget.classList.add('uw-dragging');
        document.body.classList.add('uw-is-dragging');
        this.invokeEvent('dragStart', {
            evt: e,
            actionIndex,
            actionElem: element
        });
    }
    #dragEnd(actionIndex, element, e) {
        element.classList.remove('uw-dragging');
        document.body.classList.remove('uw-is-dragging');
    }
    #dropElement(contentElem, side, e) {
        e.preventDefault();
        const actionIndex = Number(e.dataTransfer.getData('text/plain'));
        const { element, callback } = this.actionList[actionIndex];
        this.#dragEnd(actionIndex, element, e);
        this.#dragLeave(contentElem, e);
        this.setSection(side, element.cloneNode(true), callback);
        this.invokeEvent('drop', {
            evt: e,
            actionIndex,
            actionElem: element,
            contentElem,
            targetElem: e.currentTarget
        });
    }
    #dragOver(contentElem, e) {
        e.preventDefault();
        this.invokeEvent('dragOver', {
            evt: e,
            contentElem,
            targetElem: e.currentTarget
        });
    }
    #dragEnter(contentElem, e) {
        e.target.classList.add('uw-dragover');
        contentElem.classList.add('uw-dragover');
        this.invokeEvent('dragEnter', {
            evt: e,
            contentElem,
            targetElem: e.currentTarget
        });
    }
    #dragLeave(contentElem, e) {
        e.target.classList.remove('uw-dragover');
        contentElem.classList.remove('uw-dragover');
        this.invokeEvent('dragLeave', {
            evt: e,
            contentElem,
            targetElem: e.currentTarget
        });
    }
    // ---- Overrides ----
    setSection(side, element, callback) {
        super.setSection(side, element, callback);
        this.configWheel.setSectionContent(side, element.cloneNode(true));
    }
    addEvent(type, callback) {
        // @ts-ignore
        return super.addEvent(...arguments);
    }
    removeEvent(key) {
        // @ts-ignore
        return super.removeEvent(...arguments);
    }
    invokeEvent(type, ...args) {
        // @ts-ignore
        return super.invokeEvent(...arguments);
    }
}
