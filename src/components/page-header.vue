<template>
  <header class="dao-page-heading" :class="{ 'has-description': description }">
    <div>
      <div v-if="eyebrow" class="dao-eyebrow">{{ eyebrow }}</div>
      <h1 :class="colorClass">{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
    </div>
    <div v-if="$slots.default" class="dao-heading-actions"><slot /></div>
  </header>
</template>
<script>
export default {
  name: 'pageHeader',
  props: { title: { type: String, default: '' }, description: String, eyebrow: String, colorClass: { type: String, default: '' } },
};
</script>
<style scoped>
.dao-page-heading { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 24px; }
h1 { margin: 0; font-size: 28px; line-height: 1.2; font-weight: 400; }
p { margin: 12px 0 0; text-align: left; line-height: 1.6; color: #707a76; }
.dao-eyebrow { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #748079; margin-bottom: 12px; }
.dao-heading-actions { flex-shrink: 0; }
@media (max-width: 600px) { .dao-page-heading { align-items: flex-start; flex-direction: column; gap: 16px; } }
</style>
