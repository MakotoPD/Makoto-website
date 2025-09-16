<template>
	<div>
		<section class="section sectionHero">
			<AppHero/>
		</section>
		<div class="container mx-auto">
			<section class="section w-full px-4">
				<AppGrid/>
			</section>
			<section class="section mt-8">
				<AppSkills/>
			</section>
		</div>
		<div class="my-36">
			<div class="h-44 pt-8  ">
				<div class="z-0 flex w-[102dvw] translate-y-10 rotate-6 bg-linear-to-r from-sky-800 via-sky-600 to-sky-800 py-4 opacity-60 md:rotate-3 lg:translate-y-16 lg:py-8">
				</div>
				<div class="z-2 flex w-[102dvw] -rotate-3 items-center justify-center overflow-hidden bg-linear-to-r from-sky-600 via-sky-500 to-sky-600 py-1.5 will-change-transform lg:py-4">
					<UiTextScroller
						class="serif relative z-10"
						:items="['Search Optimized', 'Interactive', 'Secure', 'Reliable', 'Engaging', 'Accessible', 'Responsive', 'Dynamic', 'Scalable']"
						speed="15s"
						gap="1rem"
						separator="✦"
						:draggable="true"
					/>
				</div>
			</div>
		</div>
		<div class="container mx-auto">
			<section class="section">
				<AppProjects/>
			</section>
			<section class="section mt-64">
				<AppTrusted/>
			</section>
			<section class="section">
				<AppAbout />
			</section>
		</div>
	</div>
</template>


<style scoped>


</style>

