import { UtilityWheel, type Events, type SectionSide, type SectionCallback, type Config as ParentConfig } from './UtilityWheel.js';
export interface UIEvents extends Events {
    dragStart: (e: {
        evt: DragEvent;
        actionElem: HTMLElement;
        actionIndex: number;
    }) => void;
    dragEnd: (e: {
        evt: DragEvent;
        actionElem: HTMLElement;
        actionIndex: number;
    }) => void;
    dragOver: (args: {
        evt: DragEvent;
        contentElem: HTMLElement;
        targetElem: HTMLElement;
    }) => void;
    dragEnter: (args: {
        evt: DragEvent;
        contentElem: HTMLElement;
        targetElem: HTMLElement;
    }) => void;
    dragLeave: (args: {
        evt: DragEvent;
        contentElem: HTMLElement;
        targetElem: HTMLElement;
    }) => void;
    drop: (args: {
        evt: DragEvent;
        contentElem: HTMLElement;
        targetElem: HTMLElement;
        sectionSide: SectionSide;
        actionElem: HTMLElement;
        actionIndex: number;
    }) => void;
}
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
export declare class UtilityWheelUIConfig extends UtilityWheel {
    #private;
    /** The static utility wheel instance used for the configuration. */
    configWheel: UtilityWheel;
    /** @see {@link Config.actionList} */
    actionList: ActionData[];
    constructor(elementTarget: HTMLElement, config: Config);
    setSection(side: SectionSide, element: HTMLElement, callback: SectionCallback): void;
    addEvent<T extends keyof UIEvents>(type: T, callback: UIEvents[T]): number;
    removeEvent<T extends keyof UIEvents>(key: number | T | UIEvents[keyof Events]): void;
    invokeEvent<T extends keyof UIEvents>(type: T, ...args: Parameters<UIEvents[T]>): void;
}
export {};
