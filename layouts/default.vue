<script setup>


</script>

<template>
  <div>
    <aside class="fixed top-0 left-0 z-40 w-52 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
      <LayoutSidebar />
    </aside>
    <div class="mx-auto max-w-4xl px-2 sm:px-6 lg:px-8">
      <slot />
    </div>
  </div>
</template>
