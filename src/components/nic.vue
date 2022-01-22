<template>
  <div class="q-mx-md">
    <q-select
      v-model="selected"
      stack-label
      borderless
      label="Network Interface"
      :options="nics"
      @update:model-value="fnSelect"
    >
      <template #selected-item="scope">
        <q-item>
          <q-item-section avatar>
            <q-icon name="svguse:icons.svg#ethernet" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ scope.opt.name }}
            </q-item-label>
            <q-item-label caption>
              <div>{{ scope.opt.address }}</div>
              <div>{{ scope.opt.mac }}</div>
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>

      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section avatar>
            <q-icon name="svguse:icons.svg#ethernet" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ scope.opt.name }}</q-item-label>
            <q-item-label caption>
              <div>{{ scope.opt.address }}</div>
              <div>{{ scope.opt.mac }}</div>
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
import { computed, onBeforeMount } from 'vue'
import { useStore } from 'vuex'

export default {
  setup() {
    const { state, commit } = useStore()

    const selected = computed({
      get() {
        return state.nic.selected
      },
      set(v) {
        commit('nic/updateSelected', v)
      }
    })
    const nics = computed(() => state.nic.nics)

    const fnSelect = () => {
      window.FN.onRequest({
        command: 'selectnic',
        value: JSON.stringify(selected.value)
      })
    }

    onBeforeMount(() => {
      window.FN.onRequest({
        command: 'getnics'
      })
    })

    return {
      selected,
      nics,
      fnSelect
    }
  }
}
</script>
