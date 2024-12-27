export interface Config {
    /**
     * Choose whether the utility wheel should initially be enabled
     * (the default). This is useful when initializing
     * a static utility wheel without function.
     * @default true
     */
    enable: boolean;
    /**
     * Choose whether the utility wheel DOM target (first constructor argument)
     * should be replaced with the utility wheel instead of acting as
     * its parent.
     * @default false
     */
    replace: boolean;
    /**
     * The target the `pointerdown` event, that will invoke
     * the utility wheel, will be registered onto.
     * @see {@link UtilityWheel.enable} and {@link UtilityWheel.disable}
     *      for ways to control the event invokation.
     * @default window
     */
    eventTarget: EventTarget;
    /**
     * The mouse button that invokes the utility wheel on click
     * (default: right mouse button).
     * @see {@link UtilityWheel.invoke}
     * @default 2
     */
    invokeButton: number;
}
/** The function that's called when a section is invoked. */
export type SectionCallback = (e: PointerEvent) => void;
export type Section<T> = Record<SectionSide, T>;
/** Identifier for all of the four sections. */
export type SectionSide = 'top' | 'right' | 'bottom' | 'left';
/**
 * Available event types along with their callback outline.
 * @see {@link UtilityWheel.addEvent}
 */
export interface Events {
    invoke: () => void;
    hide: () => void;
    pointerUp: (e: PointerEvent) => void;
}
/** Simple drop-in, configurable utility wheel for front-end use. */
export declare class UtilityWheel {
    #private;
    /**
     * List of the DOM elements that serve as the mouse targets
     * of the utility wheel's four sections.
     */
    sectionsTarget: Section<HTMLElement>;
    /**
     * List of the DOM elements that hold the content
     * of the utility wheel's four sections.
     */
    sectionsContent: Section<HTMLElement>;
    /** @see {@link Config.invokeButton} */
    invokeButton: number;
    /** @see {@link Config.eventTarget} */
    eventTarget: EventTarget;
    /** The utility wheel DOM element. */
    element: HTMLElement;
    /**
     * @param elementTarget The DOM element that the utility wheel should be appended
     *                      into. Can also replace it (See {@link Config.replace}).
     */
    constructor(elementTarget: HTMLElement, { eventTarget, invokeButton, replace, enable, }?: Partial<Config>);
    /**
     * Set a section's DOM content and callback.
     * @param side Which side to set.
     * @param element The DOM content that will be added into the specific `.uw-section-content`.
     * @param callback Is called when the section is invoked.
     */
    setSection(side: SectionSide, element: HTMLElement, callback: SectionCallback): void;
    /**
     * Set only the content of one of the four sections.
     * @param side Which side to set.
     * @param element The HTML element that should be added into the section.
     */
    setSectionContent(side: SectionSide, element: HTMLElement): void;
    /**
     * Set only the callback of one of the four sections.
     * @param side Which side to set.
     * @param callback The callback that is called when the section is invoked.
     */
    setSectionCallback(side: SectionSide, callback: Function): void;
    /**
     * Enable the DOM events needed for mouse invokation.
     * Is called automatically in the constructor.
     */
    enable(): void;
    /** Remove the DOM events needed for mouse invokation.  */
    disable(): void;
    /**
     * Manually invoke the utility wheel's visibility at the given coordinates.
     * Invokes the 'invoke' event.
     */
    invoke(x: number, y: number): void;
    /**
     * Manually hide the utility wheel from the DOM.
     * Invokes the 'hide' event.
     */
    hide(): void;
    /**
     * Add a custom event listener from the available event types.
     * Returns a unique identifier that can be passed to {@link removeEvent}.
     *
     * @returns An identifier that can be used to remove the event in {@link removeEvent}.
     * @see {@link Events}
     */
    addEvent<T extends keyof Events>(type: T, callback: Events[T]): number;
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
    removeEvent<T extends keyof Events>(key: number | T | Events[keyof Events]): void;
    /**
     * Manually invoke an event from the available event types with matching arguments.
     * @see {@link Events}
     */
    invokeEvent<T extends keyof Events>(type: T, ...args: Parameters<Events[T]>): void;
    /**
     * `'context'` event handler to prevent context menu popup on click.
     * @internal
     */
    _preventContextMenu(e: MouseEvent): void;
    /** @internal */
    _pointerDown(e: PointerEvent): void;
    /** @internal */
    _pointerUp(e: PointerEvent): void;
    /** @internal */
    _keyDown(e: KeyboardEvent): void;
    /** @internal */
    _sectionUp(side: SectionSide, e: PointerEvent): void;
    /**
     * Create a UtilityWheel DOM structure and return all
     * relevant elements in various forms.
     */
    static createUtilityWheelElement(element?: HTMLElement): {
        element: HTMLElement;
        targets: Section<HTMLElement>;
        contents: Section<HTMLElement>;
        indicator: HTMLDivElement;
    };
}
