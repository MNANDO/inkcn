'use client';

import type { JSX, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { isDOMNode } from 'lexical';

type PortalImplProps = {
	children: ReactNode;
	closeOnClickOutside: boolean;
	onClose: () => void;
	title: string;
};

function PortalImpl({
	onClose,
	children,
	title,
	closeOnClickOutside,
}: PortalImplProps) {
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		modalRef.current?.focus();
	}, []);

	useEffect(() => {
		let overlayEl: HTMLElement | null = null;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};

		const onClickOutside = (event: MouseEvent) => {
			const target = event.target;
			if (
				closeOnClickOutside &&
				modalRef.current &&
				isDOMNode(target) &&
				!modalRef.current.contains(target)
			) {
				onClose();
			}
		};

		const modalEl = modalRef.current;
		if (modalEl) {
			overlayEl = modalEl.parentElement;
			overlayEl?.addEventListener('click', onClickOutside);
		}

		window.addEventListener('keydown', onKeyDown);

		return () => {
			window.removeEventListener('keydown', onKeyDown);
			overlayEl?.removeEventListener('click', onClickOutside);
		};
	}, [closeOnClickOutside, onClose]);

	return (
		<div
			className="fixed inset-0 z-100 flex items-center justify-center bg-zinc-900/60 p-4"
			role="dialog"
			aria-modal="true"
		>
			<div
				ref={modalRef}
				tabIndex={-1}
				className="relative flex min-h-25 w-full max-w-lg flex-col rounded-2xl bg-white p-5 shadow-[0_0_20px_0_rgba(0,0,0,0.35)] outline-none"
			>
				<div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-3">
					<h2 className="m-0 text-lg font-semibold text-zinc-800">{title}</h2>

					<button
						type="button"
						aria-label="Close modal"
						onClick={onClose}
						className="inline-flex h-8 w-8 items-center justify-center rounded-full border-none bg-zinc-100 p-0 text-zinc-700 transition-colors duration-150 hover:bg-zinc-200"
					>
						<span className="text-sm leading-none">✕</span>
					</button>
				</div>

				<div className="pt-4">{children}</div>
			</div>
		</div>
	);
}

export type ModalState = {
	title: string;
	content: ReactNode;
	closeOnClickOutside: boolean;
};

type ModalProps = {
	modalState: ModalState | null;
	onClose: () => void;
};

export default function EditorModal({
	modalState,
	onClose,
}: ModalProps): JSX.Element | null {
	if (modalState === null) return null;

	const { title, content, closeOnClickOutside } = modalState;

	return createPortal(
		<PortalImpl
			onClose={onClose}
			title={title}
			closeOnClickOutside={closeOnClickOutside}
		>
			{content}
		</PortalImpl>,
		document.body,
	);
}
