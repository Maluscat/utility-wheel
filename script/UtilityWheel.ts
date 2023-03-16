'use strict';
interface ConfigOptions {
  target: EventTarget;
  invokeButton: number;
};

type Section<T> = {
  [key in SectionSide]: T;
};

type SectionSide = 'top' | 'right' | 'bottom' | 'left';

class UtilityWheel {
  #sectionsTarget: Section<HTMLElement>;
  #sectionsContent: Section<HTMLElement>;
  callbacks: Partial<Section<Function>> = {};

  invokeButton;

  element;

  constructor(element: HTMLElement, { target = window, invokeButton = 2 }: Partial<ConfigOptions> = {}) {
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
    this.invoke = this.invoke.bind(this);
    this.hide = this.hide.bind(this);

    // @ts-ignore
    target.addEventListener('pointerdown', this.pointerDown);
    target.addEventListener('pointerup', this.hide);

    for (const [ side, section ] of Object.entries(this.#sectionsTarget)) {
      section.addEventListener('pointerup', this.sectionUp.bind(this, <SectionSide> side));
    }
  }

  // ---- Methods ----
  setSection(side: SectionSide, node: HTMLElement, callback: Function) {
    this.#sectionsContent[side].replaceChildren(node);
    this.callbacks[side] = callback;
  }

  // ---- Visibility handling ----
  invoke(x: number, y: number) {
    this.element.classList.remove('uw-hidden');
    this.element.style.transform = `translate(${x}px, ${y}px)`;
  }
  hide() {
    this.element.classList.add('uw-hidden');
  }

  // ---- Events ----
  pointerDown(e: PointerEvent) {
    if (e.button === this.invokeButton) {
      this.invoke(e.clientX, e.clientY);
    }
  }

  sectionUp(side: SectionSide) {
    this.callbacks[side]?.();
  }
}
