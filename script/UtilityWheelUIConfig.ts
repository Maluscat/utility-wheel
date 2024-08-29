'use strict';
import {
  UtilityWheel,
  type Events,
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

export type UIEvents = Events & GetSubsetFunction<EventArgs, {
  dragStart: 'evt' | 'actionElem' | 'actionIndex';
  dragEnd: 'evt' | 'actionElem' | 'actionIndex';
  dragOver: 'evt' | 'contentElem' | 'targetElem';
  dragEnter: 'evt' | 'contentElem' | 'targetElem';
  dragLeave: 'evt' | 'contentElem' | 'targetElem';
  drop: 'evt' | 'contentElem' | 'targetElem' | 'actionElem' | 'actionIndex';
}>

/**
 * An action is the combination of DOM element and callback
 * that can be assigned to a utility wheel's section.
 */
interface ActionData {
  /**
   * The action's DOM element.
   *
   * Will be the target of the relevant drag and drop events and
   * must be manually appended to the DOM without making a copy.
   *
   * Upon setting a utility wheel's action, this element
   * is cloned into the relevant section's content.
   */
  element: HTMLElement;
  /**
   * The callback that is set to the relevant utility wheel's
   * section once it is updated with this action.
   */
  callback: SectionCallback;
}

export interface Config extends Partial<ParentConfig> {
  /**
   * List of all available actions that can be assigned to the current
   * utility wheel, each containing its DOM element and assigned callback.
   *
   * @remarks
   * All relevant drag and drop events are added to the specified actions'
   * elements. It is your responsibility to append them somewhere to the DOM.
   *
   * For this purpose, the specified elements have to be appended to the
   * DOM as-is, since they carry event information. Do NOT clone them first.
   */
  actionList: ActionData[];
  /**
   * The DOM element that the configuration wheel
   * ({@link UtilityWheelUIConfig.configWheel}, which will be used as a
   * drop target) will be appended into.
   */
  configContainer: HTMLElement;
}


/**
 * UtilityWheel UI configuration helper.
 *
 * This library will instantiate a static utility wheel ("configuration wheel"),
 * that will be the drop target of all passed actions, inside the given container.
 * In the front-end, these actions can then be dragged and dropped onto
 * the configuration wheel to automatically reassign the underlying real
 * utility wheel with the dragged action.
 *
 * The DOM elements of the supplied actions will be given the relevant
 * drag and drop events. However, they must still be appended to the DOM
 * manually wherever fits your purposes. Everything else is handled by
 * this class.
 *
 * Several custom events may be registered using the {@link UtilityWheel}
 * event system which are invoked at different steps during the drag and
 * drop process. See {@link UIEvents} for all available events.
 */
export class UtilityWheelUIConfig extends UtilityWheel {
  /** The static utility wheel instance used for the configuration. */
  configWheel;
  /** @see {@link Config.actionList} */
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

  addEvent<T extends keyof UIEvents>(type: T, callback: UIEvents[T]) {
    // @ts-ignore
    return super.addEvent(...arguments);
  }
  removeEvent<T extends keyof UIEvents>(key: number | T | UIEvents[keyof Events]) {
    // @ts-ignore
    return super.removeEvent(...arguments);
  }
  invokeEvent<T extends keyof UIEvents>(type: T, ...args: Parameters<UIEvents[T]>) {
    // @ts-ignore
    return super.invokeEvent(...arguments);
  }
}
