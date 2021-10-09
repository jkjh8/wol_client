<template>
  <q-layout view="lHh Lpr lFf">
    <!-- <q-header class="bg-grey-1 text-black">
      <q-toolbar>
        <div class="q-ml-md">
          <q-icon name="svguse:icons.svg#power" color="red" size="sm"></q-icon>
        </div>
        <q-toolbar-title>WOL Client </q-toolbar-title>

        <div>
          <q-spinner-rings color="yellow" size="xl" />
        </div>
      </q-toolbar>
    </q-header> -->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MainLayout',
  setup() {
    return {}
  },
})
</script>
