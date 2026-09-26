<template>
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'database'"><ellipse cx="16" cy="7" rx="10" ry="4" /><path d="M6 7v6c0 5.3 20 5.3 20 0V7M6 13v6c0 5.3 20 5.3 20 0v-6M6 19v6c0 5.3 20 5.3 20 0v-6" /></template>
    <template v-else-if="name === 'globe'"><circle cx="16" cy="16" r="13" /><ellipse cx="16" cy="16" rx="5.5" ry="13" transform="rotate(-15 16 16)" /><path d="M3.5 19c8 0 19-4 25-9" /></template>
    <path v-else-if="name === 'shield'" d="M16 3c4 3 8 4 12 4-1 11-4 18-12 23C8 25 5 18 4 7c4 0 8-1 12-4Z" />
    <template v-else-if="name === 'search'"><circle cx="13" cy="13" r="8" /><path d="m19 19 8 8" /></template>
    <path v-else-if="name === 'arrow'" d="M4 16h23m-7-7 7 7-7 7" />
    <path v-else-if="name === 'menu'" d="M7 10h18M7 16h18M7 22h18" />
    <path v-else-if="name === 'check'" d="m7 16 6 6L26 9" />
    <path v-else-if="name === 'close'" d="m9 9 14 14M23 9 9 23" />
  </svg>
</template>
<script>
export default { props: { name: { type: String, required: true } } };
</script>
