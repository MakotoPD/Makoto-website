<template>
	<div class="z-10 relative h-screen w-screen flex justify-center items-center">
    
		<div class="relative z-50 text-white text-xl">
			<h1 class="serif text-5xl md:text-6xl text-center leading-18 text-shadow-lg/30 text-shadow-white max-w-2xl">
				<i18n-t keypath="page.home.hero.title" scope="global">
				<template #highlightedText>
					<span class="italic bg-gradient-to-b bg-linear-to-b from-zinc-700 via-zinc-200 to-zinc-50 bg-clip-text text-transparent">
					{{ $t('page.home.hero.titleHighlight') }}
					</span>
				</template>
				</i18n-t>
			</h1>

			<div class="serif relative">
				<h2 class="flex flex-col sm:flex-row gap-2 justify-center items-center text-md md:text-2xl">
					<span class="font-semibold text-center bg-gradient-to-b bg-linear-to-b from-zinc-700 via-zinc-200 to-zinc-50 bg-clip-text text-transparent">
						{{ $t('page.home.hero.greeting') }}
					</span>

					<div class="group relative">
						<div class="rounded-full overflow-hidden">
						<NuxtImg src="/imgs/smallAvatar.jpg" title="Makoto image" alt="profile picture" height="36" class="group-hover:scale-110 group-hover:-rotate-12 duration-300" />
						</div>
						<div class="hidden group-hover:block group-hover:animate-bounce absolute -left-3 -bottom-3">
						👋
						</div>
					</div>

					<span class="font-semibold text-center bg-gradient-to-b bg-linear-to-b from-zinc-700 via-zinc-200 to-zinc-50 bg-clip-text text-transparent">
						{{ $t('page.home.hero.role') }}
					</span>
				</h2>
				
				<NuxtImg src="/bg/elipse.png" aria-hidden="true" alt="glow in background" class="absolute -z-10 opacity-75 w-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
			</div>

			<div class="flex justify-center mt-8">
				<UButton @click="copyemail" icon="i-solar-copy-line-duotone" variant="soft" size="xl" tabindex="0" class="z-[50] bg-sky-500/20 border border-sky-400/80 text-white/80 rounded-xl px-3 py-1.5 hover:bg-sky-500/40  active:bg-sky-500/20 backdrop-blur-lg">
					contact@makoto.com.pl
				</UButton>
			</div>
		</div>


		
	</div>
</template>

<script setup lang="ts">
const toast = useToast()

const { t } = useI18n()

const copyemail = async (e: Event) => {
    const emailToCopy = 'contact@makoto.com.pl'
    let success = false;

    // --- POCZĄTEK LOGIKI KOPIOWANIA ---

    // Metoda 1: Nowoczesne API (preferowane)
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(emailToCopy);
            success = true;
        } catch (err) {
            console.error('Nie udało się skopiować za pomocą navigator.clipboard:', err);
            success = false;
        }
    } 
    // Metoda 2: Klasyczne rozwiązanie (fallback) dla HTTP i starszych przeglądarek
    else {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = emailToCopy;
            
            // Ukryj element poza ekranem
            textArea.style.position = 'absolute';
            textArea.style.left = '-9999px';
            textArea.style.top = '0';
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            // Próba skopiowania
            document.execCommand('copy');
            document.body.removeChild(textArea);
            success = true;
        } catch (err) {
            console.error('Nie udało się skopiować za pomocą document.execCommand:', err);
            success = false;
        }
    }

    // --- KONIEC LOGIKI KOPIOWANIA ---

    // Jeśli kopiowanie się powiodło, pokaż powiadomienie i animację
    if (success) {
        toast.add({
            title: t('page.home.hero.notification.title'),
            description: t('page.home.hero.notification.desc'),
            color: 'info',
            icon: 'i-solar-clipboard-check-linear',
            progress: false,
            orientation: 'horizontal',
            actions: [{
                icon: 'i-solar-plain-linear',
                label: t('page.home.hero.notification.btn'),
                color: 'neutral',
                variant: 'solid',
                onClick: () => {
                    window.open(`mailto:${emailToCopy}`, '_blank')
                }
            }]
        })

        await nextTick();
        
        const target = e.target as HTMLElement
        target.classList.add('wobble-hor-bottom')

        setTimeout(function (){
            target.classList.remove('wobble-hor-bottom')
        }, 1000);
    } 
    // Opcjonalnie: Pokaż błąd, jeśli obie metody zawiodły
    else {
        toast.add({
            title: 'Błąd',
            description: 'Nie udało się skopiować adresu e-mail.',
            color: 'error'
        })
    }
}
</script>

<style>

@-webkit-keyframes wobble-hor-bottom {
  0%,
  100% {
    -webkit-transform: translateX(0%);
            transform: translateX(0%);
    -webkit-transform-origin: 50% 50%;
            transform-origin: 50% 50%;
  }
  15% {
    -webkit-transform: translateX(-30px) rotate(-6deg);
            transform: translateX(-30px) rotate(-6deg);
  }
  30% {
    -webkit-transform: translateX(15px) rotate(6deg);
            transform: translateX(15px) rotate(6deg);
  }
  45% {
    -webkit-transform: translateX(-15px) rotate(-3.6deg);
            transform: translateX(-15px) rotate(-3.6deg);
  }
  60% {
    -webkit-transform: translateX(9px) rotate(2.4deg);
            transform: translateX(9px) rotate(2.4deg);
  }
  75% {
    -webkit-transform: translateX(-6px) rotate(-1.2deg);
            transform: translateX(-6px) rotate(-1.2deg);
  }
}
@keyframes wobble-hor-bottom {
  0%,
  100% {
    -webkit-transform: translateX(0%);
            transform: translateX(0%);
    -webkit-transform-origin: 50% 50%;
            transform-origin: 50% 50%;
  }
  15% {
    -webkit-transform: translateX(-30px) rotate(-6deg);
            transform: translateX(-30px) rotate(-6deg);
  }
  30% {
    -webkit-transform: translateX(15px) rotate(6deg);
            transform: translateX(15px) rotate(6deg);
  }
  45% {
    -webkit-transform: translateX(-15px) rotate(-3.6deg);
            transform: translateX(-15px) rotate(-3.6deg);
  }
  60% {
    -webkit-transform: translateX(9px) rotate(2.4deg);
            transform: translateX(9px) rotate(2.4deg);
  }
  75% {
    -webkit-transform: translateX(-6px) rotate(-1.2deg);
            transform: translateX(-6px) rotate(-1.2deg);
  }
}


.wobble-hor-bottom {
	-webkit-animation: wobble-hor-bottom 0.8s both;
	        animation: wobble-hor-bottom 0.8s both;
}
</style>