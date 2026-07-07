import { renderFromHtml } from '@/utils/render-from-html-string';
import { defineComponent } from 'vue';

export const RichText = defineComponent({
  name: 'RichText',
  inheritAttrs: false,
  props: {
    html: {
      type: String,
      required: true
    }
  },
  setup(props) {
    return renderFromHtml(props.html);
  }
});
