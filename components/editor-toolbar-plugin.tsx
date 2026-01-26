import type { JSX } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import Toolbar from '@/components/editor-toolbar';

export default function EditorToolbarPlugin({
	anchorElem = document.body,
}: {
	anchorElem?: HTMLElement;
}): JSX.Element | null {
	const [editor] = useLexicalComposerContext();
	return <Toolbar editor={editor} anchorElem={anchorElem} />;
}
