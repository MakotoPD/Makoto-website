<template>
	<div class="pt-24">
		<div class="absolute left-0 top-0 h-[30rem] w-full mask-y-from-60% mask-y-to-99% -z-10">
			<NuxtImg 
				src="/bg/footer.webp" 
				alt="background"
				arial-hidden 
				class="imagemask w-full h-[30rem] object-cover "  
			/>
		</div>

		<div v-if="pending" class="mt-[20rem] w-full max-w-4xl mx-auto px-12">Ładowanie...</div>
		<div v-else-if="error" class="mt-[20rem]">Błąd: {{ error }}</div>
		<div v-if="makoto?.data" class="mt-[16rem] w-full max-w-4xl mx-auto px-12 flex flex-col items-center gap-3">

				<NuxtImg class="h-36 w-36 object-cover rounded-2xl outline-offset-3 outline-2 outline-sky-500" :src="'https://api.makoto.com.pl'+makoto.data.picture.url" alt="Makoto profile picture" />
				<h2 class="text-3xl serif text-center">{{ makoto.data.name }}</h2>

				<div class="flex gap-3">
					<UBadge variant="soft" :class="styleMap[tag.theme]?.textColor + ' ' + styleMap[tag.theme]?.accentColor" v-for="tag in makoto.data.tags" :key="tag">{{ tag.name }}</UBadge>
				</div>

				<div class="flex flex-col md:flex-row items-center gap-4 my-2">
					<NuxtLink :to="localePath('/')" class="buttonweb">
						<svg class="svgIcon" viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"></path></svg>
						Website
					</NuxtLink>
					<button @click="copyemail" class="bookmarkBtn">
						<span class="IconContainer">
							<UIcon name="i-solar-copy-line-duotone" class="text-black" />
						</span>
						<p class="text">contact@makoto.com.pl</p>
					</button>
				</div>

				<div class="w-full max-w-xl flex flex-col gap-3">
					<NuxtLink 
						class="relative w-full py-3 flex justify-center bg-gray-900 border border-neutral-700 rounded-full hover:bg-gray-800 hover:border-gray-600 duration-300" 
						v-for="link in makoto.data.links"
						target="_blank"
						:to="link.link"
						>

						<UIcon class="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 size-6" :name="link.icon" />
						<p class="text-xl">{{ link.name }}</p>
					</NuxtLink>
				</div>
		</div>
	</div>
</template>

<style scoped>
.buttonweb {
    width: 120px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    background-color: rgb(20, 181, 255);
    border-radius: 30px;
    color: rgb(19, 19, 19);
    font-weight: 600;
    border: none;
    position: relative;
    cursor: pointer;
    transition-duration: .2s;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.116);
    padding-left: 8px;
    transition-duration: .5s;
}

.svgIcon {
	height: 25px;
	transition-duration: 1.5s;
}

.bell path {
	fill: rgb(19, 19, 19);
}

.buttonweb:hover {
	background-color: rgb(20, 239, 255);
	transition-duration: .5s;
}

.buttonweb:active {
	transform: scale(0.97);
	transition-duration: .2s;
}

.buttonweb:hover .svgIcon {
	transform: rotate(250deg);
	transition-duration: 1.5s;
}





.bookmarkBtn {
  width: 16rem;
  height: 40px;
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.349);
  background-color: rgb(12, 12, 12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition-duration: 0.3s;
  overflow: hidden;
}

.IconContainer {
  width: 30px;
  height: 30px;
  background: linear-gradient(to bottom, rgb(136, 255, 249), rgb(70, 166, 255));
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 2;
  transition-duration: 0.3s;
}

.icon {
  border-radius: 1px;
}

.text {
  height: 100%;
  width: 13.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 1;
  transition-duration: 0.3s;
  font-size: 1.04em;
}

.bookmarkBtn:hover .IconContainer {
  width: 15.5rem;
  transition-duration: 0.3s;
}

.bookmarkBtn:hover .text {
  transform: translate(10px);
  width: 0;
  font-size: 0;
  transition-duration: 0.3s;
}

.bookmarkBtn:active {
  transform: scale(0.95);
  transition-duration: 0.3s;
}
</style>

<script setup lang="ts">
const { find } = useStrapi()
const toast = useToast()

const { t } = useI18n()
const localePath = useLocalePath()

const { data: makoto, pending, error, refresh } = useAsyncData(
  () => `link`,
  () => find('link', { populate: "picture"}),
)

console.log(makoto)


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
        
		const emailbtn = document.querySelector('.bookmarkBtn') as HTMLElement
        emailbtn.classList.add('wobble-hor-bottom')

        setTimeout(function (){
            emailbtn.classList.remove('wobble-hor-bottom')
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




const styleMap = {
  'red': {
    textColor: 'text-red-300',
    accentColor: 'bg-red-950',
  },
  'orange': {
    textColor: 'text-orange-300',
    accentColor: 'bg-orange-950',
  },
  'amber': {
    textColor: 'text-amber-300',
    accentColor: 'bg-amber-950',
  },
  'yellow': {
    textColor: 'text-yellow-300',
    accentColor: 'bg-yellow-950',
  },
  'lime': {
    textColor: 'text-lime-300',
    accentColor: 'bg-lime-950',
  },
  'green': {
    textColor: 'text-green-300',
    accentColor: 'bg-green-950',
  },
  'emerald': {
    textColor: 'text-emerald-300',
    accentColor: 'bg-emerald-950',
  },
  'teal': {
    textColor: 'text-teal-300',
    accentColor: 'bg-teal-950',
  },
  'cyan': {
    textColor: 'text-cyan-300',
    accentColor: 'bg-cyan-950',
  },
  'sky': {
    textColor: 'text-sky-300',
    accentColor: 'bg-sky-950',
  },
  'blue': {
    textColor: 'text-blue-300',
    accentColor: 'bg-blue-950',
  },
  'indigo': {
    textColor: 'text-indigo-300',
    accentColor: 'bg-indigo-950',
  },
  'violet': {
    textColor: 'text-violet-300',
    accentColor: 'bg-violet-950',
  },
  'purple': {
    textColor: 'text-purple-300',
    accentColor: 'bg-purple-950',
  },
  'fuchsia': {
    textColor: 'text-fuchsia-300',
    accentColor: 'bg-fuchsia-950',
  },
  'pink': {
    textColor: 'text-pink-300',
    accentColor: 'bg-pink-950',
  },
  'rose': {
    textColor: 'text-rose-300',
    accentColor: 'bg-rose-950',
  },
  'slate': {
    textColor: 'text-slate-300',
    accentColor: 'bg-slate-950',
  },
  'gray': {
    textColor: 'text-gray-300',
    accentColor: 'bg-gray-950',
  },
  'zinc': {
    textColor: 'text-zinc-300',
    accentColor: 'bg-zinc-950',
  },
  'neutral': {
    textColor: 'text-neutral-300',
    accentColor: 'bg-neutral-950',
  },
  'stone': {
    textColor: 'text-stone-300',
    accentColor: 'bg-stone-950',
  }
};
</script>