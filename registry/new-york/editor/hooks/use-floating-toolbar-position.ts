import { useCallback, useEffect, useRef } from 'react';
import { mergeRegister } from '@lexical/utils';
import {
	$getSelection,
	COMMAND_PRIORITY_LOW,
	getDOMSelection,
	LexicalEditor,
	SELECTION_CHANGE_COMMAND,
} from 'lexical';

const VERTICAL_GAP = 10;
const HORIZONTAL_OFFSET = 5;

interface UseFloatingToolbarPositionOptions {
	editor: LexicalEditor;
	anchorElem: HTMLElement;
}

interface UseFloatingToolbarPositionResult {
	setPopupRef: (elem: HTMLDivElement | null) => void;
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

export function useFloatingToolbarPosition({
	editor,
	anchorElem,
}: UseFloatingToolbarPositionOptions): UseFloatingToolbarPositionResult {
	const popupRef = useRef<HTMLDivElement | null>(null);

	const updatePosition = useCallback(() => {
		const popupElem = popupRef.current;
		const nativeSelection = getDOMSelection(editor._window);

		if (popupElem === null) return;

		const rootElement = editor.getRootElement();
		const selection = $getSelection();

		if (
			selection !== null &&
			nativeSelection !== null &&
			!nativeSelection.isCollapsed &&
			rootElement !== null &&
			rootElement.contains(nativeSelection.anchorNode)
		) {
			const rangeRect = getDOMRangeRect(nativeSelection, rootElement);
			setFloatingElemPosition(rangeRect, popupElem, anchorElem, false);
		}
	}, [editor, anchorElem]);

	const setPopupRef = useCallback(
		(elem: HTMLDivElement | null) => {
			popupRef.current = elem;
			if (elem) {
				editor.getEditorState().read(() => {
					updatePosition();
				});
			}
		},
		[editor, updatePosition],
	);

	// Mouse event handlers for pointer events during drag
	useEffect(() => {
		function mouseMoveListener(e: MouseEvent) {
			if (popupRef.current && (e.buttons === 1 || e.buttons === 2)) {
				if (popupRef.current.style.pointerEvents !== 'none') {
					const elementUnderMouse = document.elementFromPoint(
						e.clientX,
						e.clientY,
					);
					if (
						elementUnderMouse &&
						!popupRef.current.contains(elementUnderMouse)
					) {
						popupRef.current.style.pointerEvents = 'none';
					}
				}
			}
		}

		function mouseUpListener() {
			if (!popupRef.current) return;
			if (popupRef.current.style.pointerEvents !== 'auto') {
				popupRef.current.style.pointerEvents = 'auto';
			}
		}

		document.addEventListener('mousemove', mouseMoveListener);
		document.addEventListener('mouseup', mouseUpListener);

		return () => {
			document.removeEventListener('mousemove', mouseMoveListener);
			document.removeEventListener('mouseup', mouseUpListener);
		};
	}, []);

	// Scroll and resize listeners
	useEffect(() => {
		const scrollerElem = anchorElem.parentElement;

		const update = () => {
			editor.getEditorState().read(() => {
				updatePosition();
			});
		};

		window.addEventListener('resize', update);
		scrollerElem?.addEventListener('scroll', update);

		return () => {
			window.removeEventListener('resize', update);
			scrollerElem?.removeEventListener('scroll', update);
		};
	}, [editor, updatePosition, anchorElem]);

	// Editor state and selection listeners
	useEffect(() => {
		editor.getEditorState().read(() => {
			updatePosition();
		});

		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					updatePosition();
				});
			}),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				() => {
					updatePosition();
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
		);
	}, [editor, updatePosition]);

	return { setPopupRef };
}
