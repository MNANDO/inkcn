import { useCallback, useEffect, useRef } from 'react';
import { mergeRegister } from '@lexical/utils';
import {
	$getSelection,
	COMMAND_PRIORITY_LOW,
	getDOMSelection,
	LexicalEditor,
	SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { getDOMRangeRect, setFloatingElemPosition } from '../lib/editor-utils';

interface UseFloatingToolbarPositionOptions {
	editor: LexicalEditor;
	anchorElem: HTMLElement;
}

interface UseFloatingToolbarPositionResult {
	setPopupRef: (elem: HTMLDivElement | null) => void;
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
