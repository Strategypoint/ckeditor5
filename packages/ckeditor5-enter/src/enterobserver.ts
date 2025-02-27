/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/enterobserver
 */

import Observer from '@ckeditor/ckeditor5-engine/src/view/observer/observer';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import BubblingEventInfo from '@ckeditor/ckeditor5-engine/src/view/observer/bubblingeventinfo';

import type { View } from '@ckeditor/ckeditor5-engine';
import type { ViewDocumentInputEvent } from '@ckeditor/ckeditor5-engine/src/view/observer/inputobserver';
import type { BubblingEvent } from '@ckeditor/ckeditor5-engine/src/view/observer/bubblingemittermixin';

const ENTER_EVENT_TYPES: Record<string, { isSoft: boolean }> = {
	insertParagraph: { isSoft: false },
	insertLineBreak: { isSoft: true }
};

/**
 * Enter observer introduces the {@link module:engine/view/document~Document#event:enter `Document#enter`} event.
 *
 * @extends module:engine/view/observer/observer~Observer
 */
export default class EnterObserver extends Observer {
	/**
	 * @inheritDoc
	 */
	constructor( view: View ) {
		super( view );

		const doc = this.document;

		doc.on<ViewDocumentInputEvent>( 'beforeinput', ( evt, data ) => {
			if ( !this.isEnabled ) {
				return;
			}

			const domEvent = data.domEvent;
			const enterEventSpec = ENTER_EVENT_TYPES[ data.inputType ];

			if ( !enterEventSpec ) {
				return;
			}

			const event = new BubblingEventInfo( doc, 'enter', data.targetRanges[ 0 ] );

			doc.fire( event, new DomEventData( view, domEvent, {
				isSoft: enterEventSpec.isSoft
			} ) );

			// Stop `beforeinput` event if `enter` event was stopped.
			// https://github.com/ckeditor/ckeditor5/issues/753
			if ( event.stop.called ) {
				evt.stop();
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public observe(): void {}
}

/**
 * Event fired when the user presses the <kbd>Enter</kbd> key.
 *
 * Note: This event is fired by the {@link module:enter/enterobserver~EnterObserver observer}
 * (usually registered by the {@link module:enter/enter~Enter Enter feature} and
 * {@link module:enter/shiftenter~ShiftEnter ShiftEnter feature}).
 *
 * @event module:engine/view/document~Document#event:enter
 * @param {module:engine/view/observer/domeventdata~DomEventData} data
 * @param {Boolean} data.isSoft Whether it's a soft enter (<kbd>Shift</kbd>+<kbd>Enter</kbd>) or hard enter (<kbd>Enter</kbd>).
 */

export type ViewDocumentEnterEvent = BubblingEvent<{
	name: 'enter';
	args: [ EnterEventData ];
}>;

export interface EnterEventData extends DomEventData<InputEvent> {
	isSoft: boolean;
}
