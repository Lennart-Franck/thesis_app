<script setup lang="ts">
const links = [
{
  label: 'Navigation',

},
 {
  label: 'RQ and Search String',
  icon: 'i-heroicons-magnifying-glass-20-solid',
  to: '/'
}, {
  label: 'Paper Sorting',
  icon: 'i-heroicons-funnel',
  to: `/paper_sorting`
}, {
  label: 'Extract Information',
  icon: 'i-heroicons-information-circle',
  to: '/extract_information'
}]
</script>

<template>
  <div class="mt-8 ml-2">
    <p class="text-lg my-2 text-gray-900 ml-2">SMS Generator</p>
    <UVerticalNavigation class=" gap-y-2" :links="links" />
  </div>
</template>

