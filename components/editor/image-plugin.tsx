'use client';

import type { JSX } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils';
import {
	$createParagraphNode,
	$createRangeSelection,
	$getSelection,
	$insertNodes,
	$isNodeSelection,
	$isRootOrShadowRoot,
	$setSelection,
	COMMAND_PRIORITY_EDITOR,
	COMMAND_PRIORITY_HIGH,
	COMMAND_PRIORITY_LOW,
	createCommand,
	DRAGOVER_COMMAND,
	DRAGSTART_COMMAND,
	DROP_COMMAND,
	isHTMLElement,
	LexicalCommand,
	LexicalEditor,
} from 'lexical';
import { useEffect } from 'react';

import {
	$createImageNode,
	$isImageNode,
	ImageNode,
	ImagePayload,
} from './nodes/ImageNode';

export type InsertImagePayload = Readonly<ImagePayload>;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
	createCommand('INSERT_IMAGE_COMMAND');

const TRANSPARENT_IMAGE =
	'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

let dragImage: HTMLImageElement | null = null;
function getDragImage(): HTMLImageElement {
	if (!dragImage) {
		dragImage = document.createElement('img');
		dragImage.src = TRANSPARENT_IMAGE;
	}
	return dragImage;
}

export default function ImagePlugin(): JSX.Element | null {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		if (!editor.hasNodes([ImageNode])) {
			throw new Error('ImagePlugin: ImageNode not registered on editor');
		}

		return mergeRegister(
			editor.registerCommand<InsertImagePayload>(
				INSERT_IMAGE_COMMAND,
				(payload) => {
					const imageNode = $createImageNode(payload);
					$insertNodes([imageNode]);
					if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
						$wrapNodeInElement(
							imageNode,
							$createParagraphNode,
						).selectEnd();
					}
					return true;
				},
				COMMAND_PRIORITY_EDITOR,
			),
			editor.registerCommand<DragEvent>(
				DRAGSTART_COMMAND,
				(event) => $onDragStart(event),
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand<DragEvent>(
				DRAGOVER_COMMAND,
				(event) => $onDragover(event),
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand<DragEvent>(
				DROP_COMMAND,
				(event) => $onDrop(event, editor),
				COMMAND_PRIORITY_HIGH,
			),
		);
	}, [editor]);

	return null;
}

function $onDragStart(event: DragEvent): boolean {
	const node = $getImageNodeInSelection();
	if (!node) {
		return false;
	}
	const dataTransfer = event.dataTransfer;
	if (!dataTransfer) {
		return false;
	}
	dataTransfer.setData('text/plain', '_');
	dataTransfer.setDragImage(getDragImage(), 0, 0);
	dataTransfer.setData(
		'application/x-lexical-drag',
		JSON.stringify({
			data: {
				altText: node.__altText,
				height: node.__height,
				key: node.getKey(),
				maxWidth: node.__maxWidth,
				src: node.__src,
				width: node.__width,
			},
			type: 'image',
		}),
	);
	return true;
}

function $onDragover(event: DragEvent): boolean {
	const node = $getImageNodeInSelection();
	if (!node) {
		return false;
	}
	if (!canDropImage(event)) {
		event.preventDefault();
	}
	return false;
}

function $onDrop(event: DragEvent, editor: LexicalEditor): boolean {
	const node = $getImageNodeInSelection();
	if (!node) {
		return false;
	}
	const data = getDragImageData(event);
	if (!data) {
		return false;
	}
	event.preventDefault();
	if (canDropImage(event)) {
		const range = getDragSelection(event);
		node.remove();
		const rangeSelection = $createRangeSelection();
		if (range !== null && range !== undefined) {
			rangeSelection.applyDOMRange(range);
		}
		$setSelection(rangeSelection);
		editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
	}
	return true;
}

function $getImageNodeInSelection(): ImageNode | null {
	const selection = $getSelection();
	if (!$isNodeSelection(selection)) {
		return null;
	}
	const nodes = selection.getNodes();
	const node = nodes[0];
	return $isImageNode(node) ? node : null;
}

function getDragImageData(event: DragEvent): InsertImagePayload | null {
	const dragData = event.dataTransfer?.getData('application/x-lexical-drag');
	if (!dragData) {
		return null;
	}
	const { type, data } = JSON.parse(dragData);
	if (type !== 'image') {
		return null;
	}
	return data;
}

declare global {
	interface DragEvent {
		rangeOffset?: number;
		rangeParent?: Node;
	}
}

function canDropImage(event: DragEvent): boolean {
	const target = event.target;
	return !!(
		isHTMLElement(target) &&
		!target.closest('code, span.editor-image') &&
		isHTMLElement(target.parentElement) &&
		target.parentElement.closest('div.ContentEditable__root')
	);
}

function getDragSelection(event: DragEvent): Range | null | undefined {
	let range;
	const target = event.target;
	const targetDocument =
		target instanceof Node
			? (target.ownerDocument ?? document)
			: document;
	if (typeof targetDocument.caretPositionFromPoint === 'function') {
		const pos = targetDocument.caretPositionFromPoint(event.clientX, event.clientY);
		if (pos) {
			range = targetDocument.createRange();
			range.setStart(pos.offsetNode, pos.offset);
			range.collapse(true);
		}
	} else if (event.rangeParent) {
		const domSelection = targetDocument.getSelection();
		if (domSelection !== null) {
			domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
			range = domSelection.getRangeAt(0);
		}
	} else {
		throw Error('Cannot get the selection when dragging');
	}
	return range;
}
