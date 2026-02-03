import { useCallback, useMemo } from 'react';
import { FORMAT_TEXT_COMMAND, LexicalEditor, TextFormatType } from 'lexical';

export interface TextFormatState {
	isBold: boolean;
	isItalic: boolean;
	isUnderline: boolean;
	isStrikethrough: boolean;
}

interface UseTextFormatToggleResult {
	handleValueChange: (values: string[]) => void;
	currentValues: string[];
}

const FORMATS: TextFormatType[] = [
	'bold',
	'italic',
	'underline',
	'strikethrough',
];

export function useTextFormatToggle(
	editor: LexicalEditor,
	formatState: TextFormatState,
): UseTextFormatToggleResult {
	const { isBold, isItalic, isUnderline, isStrikethrough } = formatState;

	const currentValues = useMemo(
		() => [
			...(isBold ? ['bold'] : []),
			...(isItalic ? ['italic'] : []),
			...(isUnderline ? ['underline'] : []),
			...(isStrikethrough ? ['strikethrough'] : []),
		],
		[isBold, isItalic, isUnderline, isStrikethrough],
	);

	const handleValueChange = useCallback(
		(values: string[]) => {
			FORMATS.forEach((format) => {
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
		},
		[editor, isBold, isItalic, isUnderline, isStrikethrough],
	);

	return { handleValueChange, currentValues };
}
