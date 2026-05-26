<template>
	<div>
		<a href="#main-content" class="skip-link">Skip to main content</a>
		<header>
			<AppHeader class="fixed z-100 top-0 left-0" />
		</header>
		<main id="main-content" tabindex="-1">
			<slot />
		</main>
		<AppFooter />
	</div>
</template>

<script lang="ts" setup>
</script>

<style>
.skip-link {
	position: absolute;
	top: -100%;
	left: 1rem;
	z-index: 99999;
	padding: 0.5rem 1rem;
	background: #000;
	color: #fff;
	border-radius: 0 0 0.5rem 0.5rem;
	font-weight: 600;
	text-decoration: none;
	transition: top 0.1s;
}
.skip-link:focus {
	top: 0;
}
</style>