'use strict';
import {
  UtilityWheel,
  type SectionSide,
  type SectionCallback,
  type Config as ParentConfig,
} from './UtilityWheel.js';

interface ActionData {
  element: HTMLElement;
  callback: SectionCallback;
}

export interface Config extends Partial<ParentConfig> {
  actionList: ActionData[];
  /**
   * The DOM element that a clone of the passed utility wheel will
   * be appended into.
   */
  configContainer: HTMLElement;
}


export class UtilityWheelUIConfig extends UtilityWheel {
  configWheel;
  actionList;

  constructor(element: HTMLElement, config: Config) {
    if (!config?.actionList || !config?.configContainer) {
      throw new Error(
        'UtilityWheelUIConfig @ constructor: Both the `actionList` and `configContainer` options need to be defined.');
    }
    super(element, config);

    this.actionList = config?.actionList ?? [];

    this.configWheel = new UtilityWheel(element.cloneNode(true) as HTMLElement, {
      enable: false
    });
    config.configContainer.appendChild(this.configWheel.element);

    this.actionList.forEach(({ element }, i) => {
      element.draggable = true;
      element.addEventListener('dragstart', <any> this.#dragStart.bind(this, i));
      element.addEventListener('dragend', <any> this.#dragEnd.bind(this, element));
    });

    for (const [ side, element ] of Object.entries(this.configWheel.sectionsTarget)) {
      const contentSection = this.configWheel.sectionsContent[side as SectionSide];
      element.addEventListener('drop', this.#dropElement.bind(this, contentSection, side as SectionSide));
      element.addEventListener('dragover', this.#dragOver.bind(this, contentSection));
      element.addEventListener('dragenter', this.#dragEnter.bind(this, contentSection));
      element.addEventListener('dragleave', this.#dragLeave.bind(this, contentSection));
    }
  }

  // ---- Drag handling ----
  #dragStart(actionIndex: number, e: DragEvent) {
    e.dataTransfer!.setData('text/plain', actionIndex.toString());
    (e.currentTarget as HTMLElement).classList.add('uw-dragging');
  }
  #dragEnd(element: HTMLElement) {
    element.classList.remove('uw-dragging');
  }
  #dropElement(contentSection: HTMLElement, side: SectionSide, e: DragEvent) {
    e.preventDefault();
    const index = Number(e.dataTransfer!.getData('text/plain'));
    const { element, callback } = this.actionList[index];

    this.#dragEnd(element);
    this.#dragLeave(contentSection, e);

    this.setSection(side, element.cloneNode(true) as HTMLElement, callback);
  }
  #dragOver(contentSection: HTMLElement, e: DragEvent) {
    e.preventDefault();
  }
  #dragEnter(contentSection: HTMLElement, e: DragEvent) {
    (e.target as HTMLElement).classList.add('uw-dragover');
    contentSection.classList.add('uw-dragover');
  }
  #dragLeave(contentSection: HTMLElement, e: DragEvent) {
    (e.target as HTMLElement).classList.remove('uw-dragover');
    contentSection.classList.remove('uw-dragover');
  }

  // ---- Overrides ----
  setSection(side: SectionSide, element: HTMLElement, callback: SectionCallback) {
    super.setSection(side, element, callback);
    this.configWheel.setSectionContent(side, element.cloneNode(true) as HTMLElement);
  }
}
