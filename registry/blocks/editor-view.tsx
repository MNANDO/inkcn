'use client';

import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { EditorState, LexicalEditor } from 'lexical';
import { ReactNode, useState } from 'react';
import EditorToolbarPlugin from '../components/editor-toolbar-plugin';
import EditorBlockControlPlugin from '../components/editor-block-control-plugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { Editor } from '../lib/Editor';

export function EditorView({
	editor,
	className,
	placeholder,
	showBlockHandle = true,
	showToolbar = true,
	onChange,
	children,
}: {
	editor: Editor;
	className?: string;
	placeholder?: string;
	showBlockHandle?: boolean;
	showToolbar?: boolean;
	onChange?: (
		editorState: EditorState,
		editor: LexicalEditor,
		tags: Set<string>,
	) => void;
	children?: ReactNode;
}) {
	const [floatingAnchorElem, setFloatingAnchorElem] =
		useState<HTMLDivElement | null>(null);

	const onRef = (_floatingAnchorElem: HTMLDivElement) => {
		if (_floatingAnchorElem !== null) {
			setFloatingAnchorElem(_floatingAnchorElem);
		}
	};

	const editorPlaceholder =
		placeholder ?? "Enter some text or type '/' for commands";

	return (
		<LexicalExtensionComposer
			extension={editor.lexicalExtension}
			contentEditable={null}
		>
			<div
				className={`relative font-normal leading-[1.7] text-black ${className ?? ''}`}
			>
				<div className="relative block bg-white">
					<RichTextPlugin
						contentEditable={
							<div className="relative z-0 flex min-h-37.5 max-w-full resize-y border-0 outline-none">
								<div
									ref={onRef}
									className="relative z-0 max-w-full flex-auto resize-y"
								>
									<ContentEditable
										className={`relative min-h-37.5 resize-none px-2.5 py-3.75 text-[15px] caret-[#444] outline-none [tab-size:1] ${showBlockHandle ? 'ml-12' : ''}`}
									/>
								</div>
							</div>
						}
						placeholder={
							<div
								className={`pointer-events-none absolute top-3.75 inline-block select-none overflow-hidden text-ellipsis text-[15px] text-[#999] ${showBlockHandle ? 'left-14.5' : 'left-2.5'}`}
							>
								{editorPlaceholder}
							</div>
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
					{floatingAnchorElem && showToolbar && (
						<EditorToolbarPlugin anchorElem={floatingAnchorElem} />
					)}
					{floatingAnchorElem && showBlockHandle && (
						<EditorBlockControlPlugin
							anchorElem={floatingAnchorElem}
						/>
					)}
					{children}
					{onChange && <OnChangePlugin onChange={onChange} />}
				</div>
			</div>
		</LexicalExtensionComposer>
	);
}
