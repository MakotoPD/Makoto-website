<template>
  <Transition name="cookie-banner">
    <div
      v-if="showBanner"
      class="fixed bottom-4 left-4 z-[9999] w-[calc(100%-2rem)] max-w-[420px] sm:w-[420px]"
    >
      <div class="cookie-card rounded-2xl border border-[var(--color-border)]/30 p-5 shadow-2xl">
        <!-- Main View -->
        <div v-if="!showSettings">
          <div class="flex items-start gap-3 mb-3">
            <div class="shrink-0 mt-0.5">
              <UIcon name="i-solar-cookie-line-duotone" class="text-2xl text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                {{ $t('cookie.title') }}
              </h3>
              <p class="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {{ $t('cookie.description') }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 mt-4">
            <UButton
              size="sm"
              color="primary"
              class="flex-1"
              @click="acceptAll"
            >
              {{ $t('cookie.accept') }}
            </UButton>
            <UButton
              size="sm"
              variant="outline"
              color="neutral"
              class="flex-1"
              @click="rejectAll"
            >
              {{ $t('cookie.reject') }}
            </UButton>
            <UButton
              size="sm"
              variant="ghost"
              color="neutral"
              class="w-full"
              @click="showSettings = true"
            >
              {{ $t('cookie.settings') }}
            </UButton>
          </div>
        </div>

        <!-- Settings View -->
        <div v-else>
          <div class="flex items-center gap-2 mb-4">
            <button
              class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              @click="showSettings = false"
            >
              <UIcon name="i-lucide-arrow-left" class="text-lg" />
            </button>
            <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
              {{ $t('cookie.settings') }}
            </h3>
          </div>

          <div class="space-y-3">
            <!-- Necessary -->
            <div class="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/5 dark:bg-white/5">
              <div class="min-w-0">
                <p class="text-xs font-medium text-[var(--color-text-primary)]">
                  {{ $t('cookie.necessary.title') }}
                </p>
                <p class="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                  {{ $t('cookie.necessary.desc') }}
                </p>
              </div>
              <div class="shrink-0 mt-0.5">
                <div class="w-9 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-end px-0.5 opacity-60 cursor-not-allowed">
                  <div class="w-4 h-4 rounded-full bg-white" />
                </div>
              </div>
            </div>

            <!-- Analytics -->
            <div class="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/5 dark:bg-white/5">
              <div class="min-w-0">
                <p class="text-xs font-medium text-[var(--color-text-primary)]">
                  {{ $t('cookie.analytics.title') }}
                </p>
                <p class="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                  {{ $t('cookie.analytics.desc') }}
                </p>
              </div>
              <div class="shrink-0 mt-0.5">
                <button
                  class="w-9 h-5 rounded-full flex items-center px-0.5 transition-colors duration-200"
                  :class="consentState.analytics ? 'bg-[var(--color-primary)] justify-end' : 'bg-[var(--color-border)] justify-start'"
                  @click="consentState.analytics = !consentState.analytics"
                >
                  <div class="w-4 h-4 rounded-full bg-white shadow transition-transform" />
                </button>
              </div>
            </div>

            <!-- Marketing -->
            <div class="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/5 dark:bg-white/5">
              <div class="min-w-0">
                <p class="text-xs font-medium text-[var(--color-text-primary)]">
                  {{ $t('cookie.marketing.title') }}
                </p>
                <p class="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                  {{ $t('cookie.marketing.desc') }}
                </p>
              </div>
              <div class="shrink-0 mt-0.5">
                <button
                  class="w-9 h-5 rounded-full flex items-center px-0.5 transition-colors duration-200"
                  :class="consentState.marketing ? 'bg-[var(--color-primary)] justify-end' : 'bg-[var(--color-border)] justify-start'"
                  @click="consentState.marketing = !consentState.marketing"
                >
                  <div class="w-4 h-4 rounded-full bg-white shadow transition-transform" />
                </button>
              </div>
            </div>
          </div>

          <UButton
            size="sm"
            color="primary"
            class="w-full mt-4"
            @click="savePreferences"
          >
            {{ $t('cookie.save') }}
          </UButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { showBanner, showSettings, consentState, acceptAll, rejectAll, savePreferences, initConsent } = useCookieConsent()

onMounted(() => {
  initConsent()
})
</script>

<style scoped>
.cookie-card {
  background: rgba(15, 16, 19, 0.8);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  background-image: linear-gradient(
    135deg,
    rgba(40, 125, 235, 0.08) 0%,
    rgba(40, 125, 235, 0.02) 50%,
    transparent 100%
  );
}

:root:not(.dark) .cookie-card {
  background: rgba(248, 249, 253, 0.85);
  background-image: linear-gradient(
    135deg,
    rgba(40, 125, 235, 0.06) 0%,
    rgba(40, 125, 235, 0.02) 50%,
    transparent 100%
  );
}

.cookie-banner-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.cookie-banner-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.cookie-banner-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.cookie-banner-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
