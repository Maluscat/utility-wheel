'use strict';
import { UtilityWheel, } from './UtilityWheel.js';
export class UtilityWheelUIConfig extends UtilityWheel {
    configWheel;
    actionList;
    constructor(element, config) {
        if (!config?.actionList || !config?.configContainer) {
            throw new Error('UtilityWheelUIConfig @ constructor: Both the `actionList` and `configContainer` options need to be defined.');
        }
        super(element, config);
        this.actionList = config?.actionList ?? [];
        this.configWheel = new UtilityWheel(element.cloneNode(true), {
            enable: false
        });
        config.configContainer.appendChild(this.configWheel.element);
        this.actionList.forEach(({ element }, i) => {
            element.draggable = true;
            element.addEventListener('dragstart', this.#dragStart.bind(this, i));
            element.addEventListener('dragend', this.#dragEnd.bind(this, element));
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
    #dragStart(actionIndex, e) {
        e.dataTransfer.dropEffect = 'move';
        e.dataTransfer.effectAllowed = 'copyMove';
        e.dataTransfer.setData('text/plain', actionIndex.toString());
        e.currentTarget.classList.add('uw-dragging');
        document.body.classList.add('uw-is-dragging');
    }
    #dragEnd(element) {
        element.classList.remove('uw-dragging');
        document.body.classList.remove('uw-is-dragging');
    }
    #dropElement(contentSection, side, e) {
        e.preventDefault();
        const index = Number(e.dataTransfer.getData('text/plain'));
        const { element, callback } = this.actionList[index];
        this.#dragEnd(element);
        this.#dragLeave(contentSection, e);
        this.setSection(side, element.cloneNode(true), callback);
    }
    #dragOver(contentSection, e) {
        e.preventDefault();
    }
    #dragEnter(contentSection, e) {
        e.target.classList.add('uw-dragover');
        contentSection.classList.add('uw-dragover');
    }
    #dragLeave(contentSection, e) {
        e.target.classList.remove('uw-dragover');
        contentSection.classList.remove('uw-dragover');
    }
    // ---- Overrides ----
    setSection(side, element, callback) {
        super.setSection(side, element, callback);
        this.configWheel.setSectionContent(side, element.cloneNode(true));
    }
}
