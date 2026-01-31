import type { JSX } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import EditorToolbar from './editor-toolbar';
import type { BlockPickerOption } from '../lib/BlockPickerOption';

export default function EditorToolbarPlugin({
	anchorElem = document.body,
	options,
}: {
	anchorElem?: HTMLElement;
	options: BlockPickerOption[];
}): JSX.Element | null {
	const [editor] = useLexicalComposerContext();
	return (
		<EditorToolbar
			editor={editor}
			anchorElem={anchorElem}
			options={options}
		/>
	);
}
