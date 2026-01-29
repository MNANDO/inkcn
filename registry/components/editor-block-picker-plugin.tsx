import type { JSX } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
	LexicalTypeaheadMenuPlugin,
	useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { TextNode } from 'lexical';
import { useCallback, useMemo, useState } from 'react';
import * as ReactDOM from 'react-dom';

import useModal from '../hooks/use-editor-modal';
import EditorModal from './editor-modal';
import { BlockPickerOption } from '../lib/BlockPickerOption';
import { BlockPickerMenuItem } from './block-picker-menu-item';

export type ShowModal = ReturnType<typeof useModal>['showModal'];

type BlockPickerPluginProps = {
	options: BlockPickerOption[];
};

export default function BlockPickerPlugin({
	options,
}: BlockPickerPluginProps): JSX.Element {
	const [editor] = useLexicalComposerContext();

	const { modalState, closeModal } = useModal();

	const [queryString, setQueryString] = useState<string | null>(null);

	const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
		allowWhitespace: true,
		minLength: 0,
	});

	const filteredOptions = useMemo(() => {
		if (!queryString) return options;

		const regex = new RegExp(queryString, 'i');

		return options.filter((option) => {
			return (
				regex.test(option.title) ||
				option.keywords.some((keyword: string) => regex.test(keyword))
			);
		});
	}, [options, queryString]);

	const onSelectOption = useCallback(
		(
			selectedOption: BlockPickerOption,
			nodeToRemove: TextNode | null,
			closeMenu: () => void,
			matchingString: string,
		) => {
			editor.update(() => {
				nodeToRemove?.remove();
				selectedOption.insert({
					editor,
					queryString: matchingString,
				});
				closeMenu();
			});
		},
		[editor],
	);

	return (
		<>
			<EditorModal modalState={modalState} onClose={closeModal} />

			<LexicalTypeaheadMenuPlugin<BlockPickerOption>
				onQueryChange={setQueryString}
				onSelectOption={onSelectOption}
				triggerFn={checkForTriggerMatch}
				options={filteredOptions}
				menuRenderFn={(
					anchorElementRef,
					{
						selectedIndex,
						selectOptionAndCleanUp,
						setHighlightedIndex,
					},
				) =>
					anchorElementRef.current && filteredOptions.length
						? ReactDOM.createPortal(
								<div className="min-w-50 max-h-50 overflow-y-auto rounded-lg bg-white p-1 shadow-md border">
									<ul className="list-none m-0 p-0">
										{filteredOptions.map(
											(option, i: number) => {
												return (
													<BlockPickerMenuItem
														key={option.key}
														index={i}
														isSelected={
															selectedIndex === i
														}
														onClick={() => {
															setHighlightedIndex(
																i,
															);
															selectOptionAndCleanUp(
																option,
															);
														}}
														onMouseEnter={() => {
															setHighlightedIndex(
																i,
															);
														}}
														setRefElement={
															option.setRefElement
														}
														icon={option.icon}
														title={option.title}
													/>
												);
											},
										)}
									</ul>
								</div>,
								anchorElementRef.current,
							)
						: null
				}
			/>
		</>
	);
}
