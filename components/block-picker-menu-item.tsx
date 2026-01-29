import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function BlockPickerMenuItem({
	index,
	isSelected,
	onClick,
	onMouseEnter,
	setRefElement,
	icon,
	title,
}: {
	index: number;
	isSelected: boolean;
	onClick: () => void;
	onMouseEnter: () => void;
	setRefElement: (element: HTMLElement | null) => void;
	icon: ReactNode;
	title: string;
}) {
	return (
		<li
			tabIndex={-1}
			className={cn(
				'flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer text-sm',
				isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
			)}
			ref={setRefElement}
			role="option"
			aria-selected={isSelected}
			id={'typeahead-item-' + index}
			onMouseEnter={onMouseEnter}
			onClick={onClick}
		>
			<span className="flex items-center justify-center size-5">{icon}</span>
			<span>{title}</span>
		</li>
	);
}
