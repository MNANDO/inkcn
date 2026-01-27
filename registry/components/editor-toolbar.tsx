'use client';

import { mergeRegister } from '@lexical/utils';
import {
	$getSelection,
	COMMAND_PRIORITY_LOW,
	FORMAT_TEXT_COMMAND,
	getDOMSelection,
	LexicalEditor,
	SELECTION_CHANGE_COMMAND,
	TextFormatType,
} from 'lexical';
import { JSX, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import {
	Bold,
	Italic,
	Underline,
	Strikethrough,
	ChevronDown,
} from 'lucide-react';

import { getDOMRangeRect, setFloatingElemPosition } from '../lib/editor-utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useEditorToolbar } from '../hooks/use-editor-toolbar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function EditorToolbar({
	editor,
	anchorElem,
}: {
	editor: LexicalEditor;
	anchorElem: HTMLElement;
}): JSX.Element | null {
	const state = useEditorToolbar(editor);
	const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

	const { isBold, isItalic, isUnderline, isStrikethrough } = state;

	// Callback ref to position toolbar immediately when element is created
	const setPopupRef = useCallback(
		(elem: HTMLDivElement | null) => {
			popupCharStylesEditorRef.current = elem;
			if (elem) {
				// Position immediately when ref is set
				editor.getEditorState().read(() => {
					const selection = $getSelection();
					const nativeSelection = getDOMSelection(editor._window);
					const rootElement = editor.getRootElement();

					if (
						selection !== null &&
						nativeSelection !== null &&
						!nativeSelection.isCollapsed &&
						rootElement !== null &&
						rootElement.contains(nativeSelection.anchorNode)
					) {
						const rangeRect = getDOMRangeRect(
							nativeSelection,
							rootElement,
						);
						setFloatingElemPosition(
							rangeRect,
							elem,
							anchorElem,
							false,
						);
					}
				});
			}
		},
		[editor, anchorElem],
	);

	function mouseMoveListener(e: MouseEvent) {
		if (
			popupCharStylesEditorRef.current &&
			(e.buttons === 1 || e.buttons === 2)
		) {
			if (
				popupCharStylesEditorRef.current.style.pointerEvents !== 'none'
			) {
				const elementUnderMouse = document.elementFromPoint(
					e.clientX,
					e.clientY,
				);
				if (
					elementUnderMouse &&
					!popupCharStylesEditorRef.current.contains(
						elementUnderMouse,
					)
				) {
					popupCharStylesEditorRef.current.style.pointerEvents =
						'none';
				}
			}
		}
	}

	function mouseUpListener() {
		if (!popupCharStylesEditorRef.current) return;
		if (popupCharStylesEditorRef.current.style.pointerEvents !== 'auto') {
			popupCharStylesEditorRef.current.style.pointerEvents = 'auto';
		}
	}

	useEffect(() => {
		if (!popupCharStylesEditorRef.current) return;

		document.addEventListener('mousemove', mouseMoveListener);
		document.addEventListener('mouseup', mouseUpListener);

		return () => {
			document.removeEventListener('mousemove', mouseMoveListener);
			document.removeEventListener('mouseup', mouseUpListener);
		};
	}, []);

	const $updateTextFormatEditorToolbar = useCallback(() => {
		const selection = $getSelection();
		const popupElem = popupCharStylesEditorRef.current;
		const nativeSelection = getDOMSelection(editor._window);

		if (popupElem === null) return;

		const rootElement = editor.getRootElement();
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

	useEffect(() => {
		const scrollerElem = anchorElem.parentElement;

		const update = () => {
			editor.getEditorState().read(() => {
				$updateTextFormatEditorToolbar();
			});
		};

		window.addEventListener('resize', update);
		scrollerElem?.addEventListener('scroll', update);

		return () => {
			window.removeEventListener('resize', update);
			scrollerElem?.removeEventListener('scroll', update);
		};
	}, [editor, $updateTextFormatEditorToolbar, anchorElem]);

	useEffect(() => {
		editor.getEditorState().read(() => {
			$updateTextFormatEditorToolbar();
		});

		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					$updateTextFormatEditorToolbar();
				});
			}),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				() => {
					$updateTextFormatEditorToolbar();
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
		);
	}, [editor, $updateTextFormatEditorToolbar]);

	if (!state.isVisible) return null;

	const clearSelection = () => {
		window.getSelection()?.removeAllRanges();
	};

	const handleValueChange = (values: string[]) => {
		const formats: TextFormatType[] = [
			'bold',
			'italic',
			'underline',
			'strikethrough',
		];
		formats.forEach((format) => {
			const isActive =
				format === 'bold'
					? isBold
					: format === 'italic'
						? isItalic
						: format === 'underline'
							? isUnderline
							: isStrikethrough;
			const shouldBeActive = values.includes(format);
			if (isActive !== shouldBeActive) {
				editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
			}
		});
	};

	return createPortal(
		<div
			ref={setPopupRef}
			className="absolute z-50 flex items-center gap-0.5 rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150"
		>
			{editor.isEditable() && (
				<ToggleGroup
					type="multiple"
					spacing={1}
					value={[
						...(isBold ? ['bold'] : []),
						...(isItalic ? ['italic'] : []),
						...(isUnderline ? ['underline'] : []),
						...(isStrikethrough ? ['strikethrough'] : []),
					]}
					onValueChange={handleValueChange}
				>
					<ToggleGroupItem
						value="bold"
						title="Bold"
						aria-label="Format text as bold"
					>
						<Bold className="h-2 w-2" />
					</ToggleGroupItem>

					<ToggleGroupItem
						value="italic"
						title="Italic"
						aria-label="Format text as italics"
					>
						<Italic className="h-2 w-2" />
					</ToggleGroupItem>

					<ToggleGroupItem
						value="underline"
						title="Underline"
						aria-label="Format text to underlined"
					>
						<Underline className="h-2 w-2" />
					</ToggleGroupItem>

					<ToggleGroupItem
						value="strikethrough"
						title="Strikethrough"
						aria-label="Format text with a strikethrough"
					>
						<Strikethrough className="h-2 w-2" />
					</ToggleGroupItem>
				</ToggleGroup>
			)}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">
						Open <ChevronDown />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuGroup>
						<DropdownMenuLabel>My Account</DropdownMenuLabel>
						<DropdownMenuItem onSelect={clearSelection}>
							Profile
						</DropdownMenuItem>
						<DropdownMenuItem onSelect={clearSelection}>
							Billing
						</DropdownMenuItem>
						<DropdownMenuItem onSelect={clearSelection}>
							Settings
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem onSelect={clearSelection}>
						GitHub
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={clearSelection}>
						Support
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={clearSelection} disabled>
						API
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>,
		anchorElem,
	);
}
