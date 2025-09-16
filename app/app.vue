<template>
  <div>
    <NuxtLoadingIndicator color="aqua" errorColor="red"  />
    <NuxtLayout>
      <UApp>
        <NuxtPage />
      </UApp>
    </NuxtLayout>
    <div class="custom-cursor">
      <div ref="cursorRef" class="custom-cursor__cursor"></div>
      <div ref="followerRef" class="custom-cursor__follower"></div>
    </div>
  </div>
</template>

<style>

.custom-cursor{
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999999;
}

.custom-cursor__cursor,
.custom-cursor__follower {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999999;
  border-radius: 50%;
  transform: translate(-50%, -50%); /* Center the element on the cursor position */
}

.custom-cursor__cursor {
  width: 8px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.281);
  backdrop-filter: invert(100%);
}

.custom-cursor__follower {
  width: 30px;
  height: 30px;
  border: 1px solid white;
}

.custom-cursor__follower.active {
  transform: scale(3);
}

@media screen and (max-width: 1023px) {
    
  .custom-cursor{
    display: none;
  }
}

</style>


<script setup lang="ts">
import { gsap } from "gsap";


onMounted(() => {
  if (innerWidth > 1023) {
    gsap.set(".custom-cursor", {xPercent: -50, yPercent: -50});

    let xTo = gsap.quickTo(".custom-cursor__cursor", "x", {duration: 0.3, ease: "power3"}),
        yTo = gsap.quickTo(".custom-cursor__cursor", "y", {duration: 0.3, ease: "power3"}),
        xTo2 = gsap.quickTo(".custom-cursor__follower", "x", {duration: 0.5, ease: "power3"}),
        yTo2 = gsap.quickTo(".custom-cursor__follower", "y", {duration: 0.5, ease: "power3"});

    window.addEventListener("mousemove", e => {
      xTo(e.clientX);
      yTo(e.clientY);
      xTo2(e.clientX);
      yTo2(e.clientY);
  });
  }




})


// // Inside <script setup> of CustomCursor.vue
// import { reactive, onMounted, onUnmounted, ref } from 'vue';
// const { $gsap } = useNuxtApp();

// const cursorRef = ref<HTMLElement | null>(null);
// const followerRef = ref<HTMLElement | null>(null);
// let ctx: gsap.Context;

// // Centralized state management for the cursor
// const cursorState = reactive({
//   x: 0,
//   y: 0,
//   isHovering: false,
//   targetBounds: { width: 0, height: 0, x: 0, y: 0 }
// });

// const updateMousePosition = (event: MouseEvent) => {
//   cursorState.x = event.clientX;
//   cursorState.y = event.clientY;
// };

// onMounted(() => {
//   ctx = $gsap.context(() => {
//     // Set initial position and fade in
//     $gsap.set(, {
//       x: window.innerWidth / 2,
//       y: window.innerHeight / 2,
//       opacity: 0
//     });
//     $gsap.to(, { opacity: 1, duration: 0.5 });

//     window.addEventListener('mousemove', updateMousePosition);

//     // Main cursor dot for immediate response
//     $gsap.to(cursorRef.value, {
//       duration: 0.15,
//       x: () => cursorState.x,
//       y: () => cursorState.y,
//       ease: 'power3.out',
//       repeat: -1
//     });

//     // Follower with a slight delay for a smooth, trailing effect
//     $gsap.to(followerRef.value, {
//       duration: 0.4, // Controls the amount of "lag"
//       x: () => cursorState.x,
//       y: () => cursorState.y,
//       ease: 'power3.out',
//       repeat: -1 // Keeps the animation running indefinitely
//     });
//   });
// });

// onUnmounted(() => {
//   ctx.revert(); // Removes the mousemove listener automatically
// });

</script>