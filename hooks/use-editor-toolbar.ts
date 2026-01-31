import {
	$getSelection,
	$isParagraphNode,
	$isRangeSelection,
	$isTextNode,
	getDOMSelection,
	LexicalEditor,
} from 'lexical';
import { $isHeadingNode, $isQuoteNode } from '@lexical/rich-text';
import { $isListNode, ListNode } from '@lexical/list';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getSelectedNode } from '../lib/editor-utils';

export type EditorToolbarState = {
	isVisible: boolean;
	isBold: boolean;
	isItalic: boolean;
	isUnderline: boolean;
	isUppercase: boolean;
	isLowercase: boolean;
	isCapitalize: boolean;
	isStrikethrough: boolean;
	isSubscript: boolean;
	isSuperscript: boolean;
	blockType: string;
};

const DEFAULT_STATE: EditorToolbarState = {
	isVisible: false,
	isBold: false,
	isItalic: false,
	isUnderline: false,
	isUppercase: false,
	isLowercase: false,
	isCapitalize: false,
	isStrikethrough: false,
	isSubscript: false,
	isSuperscript: false,
	blockType: 'paragraph',
};

function $getBlockType(editor: LexicalEditor, selection: ReturnType<typeof $getSelection>): string {
	if (!$isRangeSelection(selection)) return 'paragraph';

	const anchorNode = selection.anchor.getNode();
	const element =
		anchorNode.getKey() === 'root'
			? anchorNode
			: anchorNode.getTopLevelElementOrThrow();

	const elementDOM = editor.getElementByKey(element.getKey());
	if (elementDOM === null) return 'paragraph';

	if ($isListNode(element)) {
		const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
		const type = parentList ? parentList.getListType() : element.getListType();
		if (type === 'number') return 'ordered-list';
		if (type === 'check') return 'check-list';
		return 'unordered-list';
	}

	if ($isHeadingNode(element)) {
		const tag = element.getTag();
		return `heading-${tag.replace('h', '')}`;
	}

	if ($isQuoteNode(element)) return 'quote';

	return 'paragraph';
}

export function useEditorToolbar(editor: LexicalEditor): EditorToolbarState {
	const [toolbarState, setEditorToolbarState] =
		useState<EditorToolbarState>(DEFAULT_STATE);
	const isMouseDownRef = useRef(false);

	const update = useCallback(
		(forceShow = false) => {
			editor.getEditorState().read(() => {
				if (editor.isComposing()) return;

				if (isMouseDownRef.current && !forceShow) {
					return;
				}

				const selection = $getSelection();
				const nativeSelection = getDOMSelection(editor._window);
				const rootElement = editor.getRootElement();

				if (
					nativeSelection !== null &&
					(!$isRangeSelection(selection) ||
						rootElement === null ||
						!rootElement.contains(nativeSelection.anchorNode))
				) {
					setEditorToolbarState(DEFAULT_STATE);
					return;
				}

				if (!$isRangeSelection(selection)) return;

				const node = getSelectedNode(selection);

				const hasText = selection.getTextContent() !== '';
				const isText =
					hasText && ($isTextNode(node) || $isParagraphNode(node));

				const rawTextContent = selection
					.getTextContent()
					.replace(/\n/g, '');
				const isCollapsedWhitespaceSelection =
					!selection.isCollapsed() && rawTextContent === '';

				if (!isText || isCollapsedWhitespaceSelection) {
					setEditorToolbarState(DEFAULT_STATE);
					return;
				}

				setEditorToolbarState({
					isVisible: true,
					isBold: selection.hasFormat('bold'),
					isItalic: selection.hasFormat('italic'),
					isUnderline: selection.hasFormat('underline'),
					isUppercase: selection.hasFormat('uppercase'),
					isLowercase: selection.hasFormat('lowercase'),
					isCapitalize: selection.hasFormat('capitalize'),
					isStrikethrough: selection.hasFormat('strikethrough'),
					isSubscript: selection.hasFormat('subscript'),
					isSuperscript: selection.hasFormat('superscript'),
					blockType: $getBlockType(editor, selection),
				});
			});
		},
		[editor],
	);

	useEffect(() => {
		const rootElement = editor.getRootElement();
		if (!rootElement) return;

		const handleMouseDown = () => {
			isMouseDownRef.current = true;
			setEditorToolbarState(DEFAULT_STATE);
		};

		const handleMouseUp = () => {
			isMouseDownRef.current = false;
			update(true);
		};

		rootElement.addEventListener('mousedown', handleMouseDown);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			rootElement.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [editor, update]);

	useEffect(() => {
		document.addEventListener('selectionchange', () => update());
		return () =>
			document.removeEventListener('selectionchange', () => update());
	}, [update]);

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(() => update()),
			editor.registerRootListener(() => {
				if (editor.getRootElement() === null) {
					setEditorToolbarState(DEFAULT_STATE);
				}
			}),
		);
	}, [editor, update]);

	return toolbarState;
}
