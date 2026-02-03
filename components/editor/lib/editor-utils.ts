import { $isAtNodeEnd } from '@lexical/selection';
import { ElementNode, RangeSelection, TextNode } from 'lexical';
import type { BlockPickerOption, BlockCategory } from './BlockPickerOption';

const VERTICAL_GAP = 10;
const HORIZONTAL_OFFSET = 5;

export function setFloatingElemPosition(
	targetRect: DOMRect | null,
	floatingElem: HTMLElement,
	anchorElem: HTMLElement,
	isLink: boolean = false,
	verticalGap: number = VERTICAL_GAP,
	horizontalOffset: number = HORIZONTAL_OFFSET,
): void {
	const scrollerElem = anchorElem.parentElement;

	if (targetRect === null || !scrollerElem) {
		floatingElem.style.opacity = '0';
		floatingElem.style.top = '-10000px';
		floatingElem.style.left = '-10000px';
		return;
	}

	const floatingElemRect = floatingElem.getBoundingClientRect();
	const anchorElementRect = anchorElem.getBoundingClientRect();
	const editorScrollerRect = scrollerElem.getBoundingClientRect();

	let top = targetRect.top - floatingElemRect.height - verticalGap;
	let left = targetRect.left - horizontalOffset;

	const selection = window.getSelection();
	if (selection && selection.rangeCount > 0) {
		const range = selection.getRangeAt(0);
		const textNode = range.startContainer;
		if (textNode.nodeType === Node.ELEMENT_NODE || textNode.parentElement) {
			const textElement =
				textNode.nodeType === Node.ELEMENT_NODE
					? (textNode as Element)
					: (textNode.parentElement as Element);
			const textAlign = window.getComputedStyle(textElement).textAlign;

			if (textAlign === 'right' || textAlign === 'end') {
				left =
					targetRect.right -
					floatingElemRect.width +
					horizontalOffset;
			}
		}
	}

	if (top < editorScrollerRect.top) {
		top +=
			floatingElemRect.height +
			targetRect.height +
			verticalGap * (isLink ? 9 : 2);
	}

	if (left + floatingElemRect.width > editorScrollerRect.right) {
		left =
			editorScrollerRect.right -
			floatingElemRect.width -
			horizontalOffset;
	}

	if (left < editorScrollerRect.left) {
		left = editorScrollerRect.left + horizontalOffset;
	}

	top -= anchorElementRect.top;
	left -= anchorElementRect.left;

	floatingElem.style.opacity = '1';
	floatingElem.style.top = `${top}px`;
	floatingElem.style.left = `${left}px`;
}

export function getSelectedNode(
	selection: RangeSelection,
): TextNode | ElementNode {
	const anchor = selection.anchor;
	const focus = selection.focus;
	const anchorNode = selection.anchor.getNode();
	const focusNode = selection.focus.getNode();
	if (anchorNode === focusNode) {
		return anchorNode;
	}
	const isBackward = selection.isBackward();
	if (isBackward) {
		return $isAtNodeEnd(focus) ? anchorNode : focusNode;
	} else {
		return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
	}
}

export function getDOMRangeRect(
	nativeSelection: Selection,
	rootElement: HTMLElement,
): DOMRect {
	const domRange = nativeSelection.getRangeAt(0);

	let rect;

	if (nativeSelection.anchorNode === rootElement) {
		let inner = rootElement;
		while (inner.firstElementChild != null) {
			inner = inner.firstElementChild as HTMLElement;
		}
		rect = inner.getBoundingClientRect();
	} else {
		rect = domRange.getBoundingClientRect();
	}

	return rect;
}

const TOOLBAR_BLOCK_CATEGORIES: BlockCategory[] = [
	'basic',
	'headings',
	'lists',
	'quotes',
];

export function filterBlockOptions(
	options: BlockPickerOption[],
): BlockPickerOption[] {
	return options.filter((opt) =>
		TOOLBAR_BLOCK_CATEGORIES.includes(opt.category),
	);
}
