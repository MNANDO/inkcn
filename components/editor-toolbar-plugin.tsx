import type { JSX } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import EditorToolbar from './editor-toolbar';

export default function EditorToolbarPlugin({
	anchorElem = document.body,
}: {
	anchorElem?: HTMLElement;
}): JSX.Element | null {
	const [editor] = useLexicalComposerContext();
	return <EditorToolbar editor={editor} anchorElem={anchorElem} />;
}
