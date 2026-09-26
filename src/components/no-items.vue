<template>
  <q-item class="dao-no-items">
    <q-item-section>
      <q-item-label caption>
        <q-icon name="inbox" class="dao-empty-icon" aria-hidden="true" />
        {{ text }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "noItems",
  props: {
    text: {
      type: String,
      default: "No items",
    },
  },
  data() {
    return {};
  },
});
</script>
