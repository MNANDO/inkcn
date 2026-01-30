import { ReactNode } from 'react';

import { BlockPickerOption } from '../lib/BlockPickerOption';
import { BlockPickerMenuItem } from './block-picker-menu-item';

type BlockPickerMenuProps = {
	options: BlockPickerOption[];
	selectedIndex: number | null;
	onSelectOption: (option: BlockPickerOption, index: number) => void;
	onSetHighlightedIndex: (index: number) => void;
};

export function BlockPickerMenu({
	options,
	selectedIndex,
	onSelectOption,
	onSetHighlightedIndex,
}: BlockPickerMenuProps) {
	return (
		<div className="min-w-50 max-h-50 overflow-y-auto rounded-lg bg-white p-1 shadow-md border">
			<ul className="list-none m-0 p-0">
				{options.map((option, i: number) => (
					<BlockPickerMenuItem
						key={option.key}
						index={i}
						isSelected={selectedIndex === i}
						onClick={() => {
							onSetHighlightedIndex(i);
							onSelectOption(option, i);
						}}
						onMouseEnter={() => {
							onSetHighlightedIndex(i);
						}}
						setRefElement={option.setRefElement}
						icon={option.icon}
						title={option.title}
					/>
				))}
			</ul>
		</div>
	);
}
