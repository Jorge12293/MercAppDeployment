<script setup>
import AppNav from '@/components/AppNav.vue'
import AppLoader from '@/components/AppLoader.vue'
</script>

<template>
  <AppNav />
  <RouterView v-slot="{ Component }">
    <Suspense>
      <template #default>
        <component :is="Component" />
      </template>
      <template #fallback>
        <AppLoader />
      </template>
    </Suspense>
  </RouterView>
</template>
