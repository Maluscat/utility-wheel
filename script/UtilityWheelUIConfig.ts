'use strict';
import {
  UtilityWheel,
  type EventData,
  type SectionSide,
  type SectionCallback,
  type Config as ParentConfig,
} from './UtilityWheel.js';

type GetSubsetFunction<Set extends Record<string, any>, T extends Record<string, keyof Set>> = {
  [ Key in keyof T ]: (args: Pick<Set, T[Key]>) => void
};

interface EventArgs {
  evt: DragEvent;
  actionIndex: number;
  actionElem: HTMLElement;
  contentElem: HTMLElement;
  targetElem: HTMLElement;
  side: SectionSide;
}

type UIEventData = EventData & GetSubsetFunction<EventArgs, {
  dragStart: 'evt' | 'actionElem' | 'actionIndex';
  dragEnd: 'evt' | 'actionElem' | 'actionIndex';
  dragOver: 'evt' | 'contentElem' | 'targetElem';
  dragEnter: 'evt' | 'contentElem' | 'targetElem';
  dragLeave: 'evt' | 'contentElem' | 'targetElem';
  drop: 'evt' | 'contentElem' | 'targetElem' | 'actionElem' | 'actionIndex';
}>

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
    this.configWheel.element.classList.add('uw-configuration-wheel');
    config.configContainer.appendChild(this.configWheel.element);

    this.actionList.forEach(({ element }, i) => {
      element.draggable = true;
      element.addEventListener('dragstart', <any> this.#dragStart.bind(this, i, element));
      element.addEventListener('dragend', <any> this.#dragEnd.bind(this, i, element));
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
  #dragStart(actionIndex: number, element: HTMLElement, e: DragEvent) {
    e.dataTransfer!.dropEffect = 'move';
    e.dataTransfer!.effectAllowed = 'copyMove';
    e.dataTransfer!.setData('text/plain', actionIndex.toString());
    (e.currentTarget as HTMLElement).classList.add('uw-dragging');
    document.body.classList.add('uw-is-dragging');

    this.invokeEvent('dragStart', {
      evt: e,
      actionIndex,
      actionElem: element
    });
  }
  #dragEnd(actionIndex: number, element: HTMLElement, e: DragEvent) {
    element.classList.remove('uw-dragging');
    document.body.classList.remove('uw-is-dragging');
  }
  #dropElement(contentElem: HTMLElement, side: SectionSide, e: DragEvent) {
    e.preventDefault();
    const actionIndex = Number(e.dataTransfer!.getData('text/plain'));
    const { element, callback } = this.actionList[actionIndex];

    this.#dragEnd(actionIndex, element, e);
    this.#dragLeave(contentElem, e);
    this.setSection(side, element.cloneNode(true) as HTMLElement, callback);

    this.invokeEvent('drop', {
      evt: e,
      actionIndex,
      actionElem: element,
      contentElem,
      targetElem: e.currentTarget as HTMLElement
    });
  }
  #dragOver(contentElem: HTMLElement, e: DragEvent) {
    e.preventDefault();

    this.invokeEvent('dragOver', {
      evt: e,
      contentElem,
      targetElem: e.currentTarget as HTMLElement
    });
  }
  #dragEnter(contentElem: HTMLElement, e: DragEvent) {
    (e.target as HTMLElement).classList.add('uw-dragover');
    contentElem.classList.add('uw-dragover');

    this.invokeEvent('dragEnter', {
      evt: e,
      contentElem,
      targetElem: e.currentTarget as HTMLElement
    });
  }
  #dragLeave(contentElem: HTMLElement, e: DragEvent) {
    (e.target as HTMLElement).classList.remove('uw-dragover');
    contentElem.classList.remove('uw-dragover');

    this.invokeEvent('dragLeave', {
      evt: e,
      contentElem,
      targetElem: e.currentTarget as HTMLElement
    });
  }

  // ---- Overrides ----
  setSection(side: SectionSide, element: HTMLElement, callback: SectionCallback) {
    super.setSection(side, element, callback);
    this.configWheel.setSectionContent(side, element.cloneNode(true) as HTMLElement);
  }

  addEvent<T extends keyof UIEventData>(type: T, callback: UIEventData[T]) {
    // @ts-ignore
    return super.addEvent(...arguments);
  }
  removeEvent<T extends keyof UIEventData>(key: number | T | UIEventData[keyof EventData]) {
    // @ts-ignore
    return super.removeEvent(...arguments);
  }
  invokeEvent<T extends keyof UIEventData>(type: T, ...args: Parameters<UIEventData[T]>) {
    // @ts-ignore
    return super.invokeEvent(...arguments);
  }
}
