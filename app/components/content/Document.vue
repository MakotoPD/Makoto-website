<script lang="ts">
import { defineComponent, h, type PropType } from 'vue'
import type { RichNode } from '#shared/content'
import { renderRichNode } from '~/utils/richDocument'

export default defineComponent({
  name: 'ContentDocument',
  props: { document: { type: Object as PropType<RichNode>, required: true } },
  setup(props) {
    return () => h('div', { class: 'content-document max-w-none' }, [renderRichNode(props.document)])
  }
})
</script>

<style src="~/assets/css/rich-content.css"></style>
