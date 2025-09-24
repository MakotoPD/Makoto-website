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


</script>