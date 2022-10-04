/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ConfigurableFocusTrap, ConfigurableFocusTrapFactory} from '@angular/cdk/a11y';
import {DOCUMENT} from '@angular/common';
import {Component, ElementRef, HostBinding, HostListener, Inject, Optional, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActiveModal} from './active-modal';

// hcmodal[0].setAttribute('class', options.isResizable ? `hc-modal-resizable hc-modal-${options.size}` : `hc-modal-static hc-modal-${options.size}`);

@Component({
    selector: 'hc-modal-window',
    template: `
        <div #focusTrapElement
            class="hc-modal {{_disableFullScreen ? '' : 'hc-modal-responsive'}} {{_isResizable ? 'hc-modal-resizable' : 'hc-modal-static'}} hc-modal-{{_size}}
            {{_tight ? 'hc-modal-tight' : ''}}"
            cdkDrag [cdkDragDisabled]="!_isDraggable" cdkDragBoundary=".hc-modal-window">
            <div *ngIf="_isDraggable" class="hc-modal-drag-handle" cdkDragHandle>
                <svg width="24px" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"></path>
                    <path d="M0 0h24v24H0z" fill="none"></path>
                </svg>
            </div>
            <ng-content></ng-content>
        </div>
    `,
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./modal-window.component.scss'],
    animations: [
        trigger('fadeInOut', [
            state('in', style({opacity: 1})),
            transition('void <=> *', [
                style({
                    opacity: 0
                }),
                animate('0.2s ease-in-out')
            ])
        ])
    ]
})
export class ModalWindowComponent {
    _ignoreOverlayClick = false;
    _isDraggable = false;
    _isResizable = false;
    _size = 'auto';
    _tight = false;
    _disableFullScreen = false;
    _restoreFocus = true;
    _autoFocus = false;
    _previouslyFocusedElement: HTMLElement | null;
    _focusTrap: ConfigurableFocusTrap | undefined;

    @HostBinding('class.hc-modal-window') _hostClass = true;

    constructor(
        private activeModal: ActiveModal,
        private el: ElementRef,
        @Optional() @Inject(DOCUMENT) private _document: any,
        private _focusTrapFactory: ConfigurableFocusTrapFactory
    ) {}

    /** Reference to the element to build a focus trap around. */
    @ViewChild('focusTrapElement')
    private _focusTrapElement: ElementRef;

    @HostBinding('@fadeInOut')
    _fadeInOut(): unknown {
        return state;
    }

    @HostListener('mousedown', ['$event'])
    _overlayClick(event: unknown): void {
        let modalContentNotPresent = true;
        const path = this._eventPath(event);
        const modalWindowTargetIncluded = path.findIndex(p => p === this.el.nativeElement) > -1;
        const classList: (DOMTokenList | undefined)[] = path.map(p => p.classList);
        for (const cl of classList) {
            if (cl) {
                if (cl.contains('hc-modal-content')) {
                    modalContentNotPresent = false;
                }
            }
        }

        /* The hc-modal has 100% height (although not completely visible).
            To enable closing the modal while clicking above or below the modal (in
            addition to the sides) this function will check to see if the click
            event includes:
                1. This window element
                2. Not the hc-modal-content and
                3. the overlay click option is disabled. */
        if (!this._ignoreOverlayClick && modalContentNotPresent && modalWindowTargetIncluded) {
            this.activeModal.dismiss();
        }
    }

    // Serves as a polyfill for Event.composedPath() or Event.Path
    _eventPath(evt: any): typeof globalThis[] {
        const path = (evt.composedPath && evt.composedPath()) || evt.path,
            target = evt.target;

        if (path != null) {
            // Safari doesn't include Window, but it should.
            return path.indexOf(window) < 0 ? path.concat(window) : path;
        }

        if (target === window) {
            return [window];
        }

        function _getParents(node, memo?) {
            memo = memo || [];
            const parentNode = node.parentNode;

            if (!parentNode) {
                return memo;
            } else {
                return _getParents(parentNode, memo.concat(parentNode));
            }
        }

        return [target].concat(_getParents(target), window);
    }

    /** Save a reference to the element focused before the modal was opened. */
    _savePreviouslyFocusedElement(): void {
        if (this._document) {
            this._previouslyFocusedElement = this._document.activeElement as HTMLElement;
        }
    }

    /** Move the focus inside the focus trap and remember where to return later. */
    _trapFocus(): void {
        if (!this._focusTrapElement) {
            return;
        }

        this._savePreviouslyFocusedElement();

        if (!this._focusTrap && this._focusTrapElement) {
            this._focusTrap = this._focusTrapFactory.create(this._focusTrapElement.nativeElement);
        }

        if (this._autoFocus && this._focusTrap) {
            this._focusTrap.focusInitialElementWhenReady();
        }
    }
}
