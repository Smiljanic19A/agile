<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { RouterView } from 'vue-router'

const route = useRoute()

watch(
  () => route.meta.variant,
  (v) => {
    if (v) {
      document.documentElement.dataset.theme = v
    } else {
      delete document.documentElement.dataset.theme
    }
  },
  { immediate: true }
)
</script>

<template>
  <RouterView />
</template>
