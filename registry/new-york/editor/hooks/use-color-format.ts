import { useCallback } from 'react';
import { $getSelection, $isRangeSelection, LexicalEditor } from 'lexical';
import { $patchStyleText } from '@lexical/selection';

export function useColorFormat(editor: LexicalEditor) {
	const applyFontColor = useCallback(
		(color: string | null) => {
			editor.update(() => {
				const selection = $getSelection();
				if ($isRangeSelection(selection)) {
					$patchStyleText(selection, { color });
				}
			});
		},
		[editor],
	);

	const applyBgColor = useCallback(
		(color: string | null) => {
			editor.update(() => {
				const selection = $getSelection();
				if ($isRangeSelection(selection)) {
					$patchStyleText(selection, { 'background-color': color });
				}
			});
		},
		[editor],
	);

	return { applyFontColor, applyBgColor };
}
