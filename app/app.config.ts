export default defineAppConfig({
	title: 'Makoto',
    defaultCountry: 'en',
	ui: {
		colors: {
			primary: 'sky',
			gray: 'zinc',
			neutral: 'slate'
		},
		toast: {
			slots: {
				root: 'relative group overflow-hidden bg-black/20 dark:bg-black/40 backdrop-blur-xl shadow-lg rounded-lg ring ring-default p-4 flex gap-2.5 focus:outline-none',
				wrapper: 'w-0 flex-1 flex flex-col',
				title: 'text-sm font-medium text-sky-500 dark:text-white',
				description: 'text-sm text-muted',
				icon: 'shrink-0 size-5',
				avatar: 'shrink-0',
				avatarSize: '2xl',
				actions: 'flex gap-1.5 shrink-0',
				progress: 'absolute inset-x-0 bottom-0',
				close: 'p-0'
			},
			variants: {
				color: {
				primary: {
					root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
					icon: 'text-primary'
				},
				secondary: {
					root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary',
					icon: 'text-secondary'
				},
				success: {
					root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-success',
					icon: 'text-success'
				},
				info: {
					root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-info',
					icon: 'text-info'
				},
				warning: {
					root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-warning',
					icon: 'text-warning'
				},
				error: {
					root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-error',
					icon: 'text-error'
				},
				neutral: {
					root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-inverted',
					icon: 'text-highlighted'
				}
				},
				orientation: {
				horizontal: {
					root: 'items-center',
					actions: 'items-center'
				},
				vertical: {
					root: 'items-start',
					actions: 'items-start mt-2.5'
				}
				},
				title: {
				true: {
					description: 'mt-1'
				}
				}
			},
			defaultVariants: {
				color: 'primary'
			}
		},
		marquee: {
			variants: {
				overlay: {
				true: {
					root: 'before:absolute before:pointer-events-none before:content-[""] before:z-2 before:from-[#f8f9fd] before:dark:from-[#0f1013] before:to-transparent after:absolute after:pointer-events-none after:content-[""] after:z-2 after:from-[#f8f9fd] after:dark:from-[#0f1013] after:to-transparent'
				}
				}
			},
		},
		selectMenu: {
			slots: {
				base: [
				'relative group rounded-md inline-flex items-center focus:outline-none disabled:cursor-not-allowed disabled:opacity-75',
				'transition-colors'
				],
				content: [
					'max-h-60 w-(--reka-select-trigger-width) bg-white dark:bg-black shadow-lg rounded-md ring ring-default overflow-hidden data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-select-content-transform-origin) pointer-events-auto flex flex-col',
					'origin-(--reka-combobox-content-transform-origin) w-(--reka-combobox-trigger-width)'
				],

			},
			variants: {
				variant: {
					outline: 'text-highlighted bg-elevanted dark:bg-black/50 ring ring-inset ring-accented',
					soft: 'text-highlighted bg-elevanted dark:bg-elevated/50 hover:bg-elevated focus:bg-elevated disabled:bg-elevated/50',
					subtle: 'text-highlighted bg-elevanted dark:bg-elevated ring ring-inset ring-accented',
					ghost: 'text-highlighted bg-transparent hover:bg-elevated focus:bg-elevated disabled:bg-transparent dark:disabled:bg-transparent',
					none: 'text-highlighted bg-transparent'
				},
			},
		},
		drawer: {
			slots: {
				overlay: 'fixed inset-0 bg-elevated/75',
				content: 'fixed bg-slate-200 dark:bg-zinc-950 max-w-3xl mx-auto ring ring-zinc-300 dark:ring-zinc-700 flex focus:outline-none',
				handle: [
					'shrink-0 !bg-zinc-400 dark:!bg-accented',
					'transition-opacity'
				],
				container: 'w-full flex flex-col gap-4 p-4 overflow-y-auto',
				header: '',
				title: 'text-highlighted font-semibold',
				description: 'mt-1 text-muted text-sm',
				body: 'flex-1',
				footer: 'flex flex-col gap-1.5'
			},
		}
	}
})