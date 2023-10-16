'use strict';
interface ConfigOptions {
  /**
   * The target the `pointerdown` event will be registered onto.
   * @see {@link UtilityWheel.enable} and {@link UtilityWheel.disable}
   * for ways to control the event invokation.
   */
  target: EventTarget;
  /**
   * The mouse button that invokes the utility wheel on click.
   * @see {@link UtilityWheel.invoke}
   */
  invokeButton: number;
};

type Section<T> = Record<SectionSide, T>;

type SectionSide = 'top' | 'right' | 'bottom' | 'left';
/** Available event types to register in {@link UtilityWheel.addEvent} */
type EventType = 'invoke' | 'hide' | 'pointerUp';

class UtilityWheel {
  #sectionsTarget: Section<HTMLElement>;
  #sectionsContent: Section<HTMLElement>;
  callbacks: Partial<Section<Function>> = {};

  #eventCounter = 0;
  #events: Record<EventType, Record<number, Function>> = {
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
  constructor(element: HTMLElement, { target = window, invokeButton = 2 }: Partial<ConfigOptions> = {}) {
    this.target = target;
    this.element = element;
    this.invokeButton = invokeButton;

    this.#sectionsTarget = {
      top: element.querySelector('.uw-section-target.uw-top')!,
      right: element.querySelector('.uw-section-target.uw-right')!,
      bottom: element.querySelector('.uw-section-target.uw-bottom')!,
      left: element.querySelector('.uw-section-target.uw-left')!,
    };
    this.#sectionsContent = {
      top: element.querySelector('.uw-section-content.uw-top')!,
      right: element.querySelector('.uw-section-content.uw-right')!,
      bottom: element.querySelector('.uw-section-content.uw-bottom')!,
      left: element.querySelector('.uw-section-content.uw-left')!,
    };

    this.pointerDown = this.pointerDown.bind(this);
    this.pointerUp = this.pointerUp.bind(this);
    this.preventContextMenu = this.preventContextMenu.bind(this);
    this.keyDown = this.keyDown.bind(this);

    this.element.querySelector('.uw-circle-indicator')!
      .addEventListener('contextmenu', <any> this.preventContextMenu);

    for (const [ side, section ] of Object.entries(this.#sectionsTarget)) {
      section.addEventListener('pointerup', this.sectionUp.bind(this, <SectionSide> side));
    }

    this.enable();
  }

  // ---- Methods ----
  /**
   * Sets a section's DOM content and callback.
   * @param side Which side to set.
   * @param node The DOM content that will be added into the specific `.uw-section-content`.
   * @param callback The function that's called when a section is invoked.
   */
  setSection(side: SectionSide, node: HTMLElement, callback: Function) {
    this.#sectionsContent[side].replaceChildren(node);
    this.callbacks[side] = callback;
  }

  /**
   * Enables the DOM events for mouse invokation.
   * Is called automatically in the constructor.
   * @see the counterpart {@link disable}
   */
  enable() {
    this.target.addEventListener('pointerdown', <any> this.pointerDown);
    this.target.addEventListener('contextmenu', <any> this.preventContextMenu);
  }
  /**
   * Disables the DOM events for mouse invokation.
   * @see the counterpart {@link enable}
   */
  disable() {
    this.target.removeEventListener('pointerdown', <any> this.pointerDown);
    this.target.removeEventListener('contextmenu', <any> this.preventContextMenu);
  }

  // ---- Visibility handling ----
  /**
   * Manually invokes the utility wheel's visibility at the given coordinates.
   * Invokes the 'invoke' event.
   */
  invoke(x: number, y: number) {
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
  addEvent(type: EventType, callback: Function) {
    this.#events[type][this.#eventCounter++] = callback;
    return this.#eventCounter - 1;
  }
  /**
   * Removes a custom event by its unique identifier.
   * @see {@link addEvent}.
   */
  removeEvent(index: number) {
    for (const events of Object.values(this.#events)) {
      delete events[index];
    }
  }

  /**
   * Manually invokes all events of a given type with custom arguments.
   * @see {@link EventType}.
   */
  invokeEvent(type: EventType, ...args: any[]) {
    for (const callback of Object.values(this.#events[type])) {
      callback(...args);
    }
  }

  // ---- Events ----
  preventContextMenu(e: MouseEvent) {
    if (e.button === this.invokeButton) {
      e.preventDefault();
    }
  }

  pointerDown(e: PointerEvent) {
    if (e.button === this.invokeButton) {
      window.addEventListener('pointerup', this.pointerUp);
      window.addEventListener('keydown', this.keyDown);
      this.invoke(e.clientX, e.clientY);
    }
  }
  pointerUp(e: PointerEvent) {
    this.#hideAndRemoveEvents();
    this.invokeEvent('pointerUp', e);
  }

  keyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.#hideAndRemoveEvents();
    }
  }

  sectionUp(side: SectionSide, e: PointerEvent) {
    this.callbacks[side]?.(e);
  }

  // ---- Event helpers ----
  #hideAndRemoveEvents() {
    window.removeEventListener('pointerup', this.pointerUp);
    window.removeEventListener('keydown', this.keyDown);
    this.hide();
  }
}
