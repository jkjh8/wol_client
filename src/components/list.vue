<template>
  <q-list>
    <q-item>
      <q-item-section avatar>
        <q-icon name="svguse:icons.svg#adjustments" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Signal</q-item-label>
        <q-item-label caption
          >컴퓨터 디바이스 정보를 서버로 전송</q-item-label
        >
      </q-item-section>
      <q-item-section side>
        <q-btn
          style="width: 4rem; height: 1rem; border-radius: 0.4rem"
          :color="signal ? 'green' : ''"
          :text-color="signal ? 'grey-1' : 'grey-10'"
          :label="signal ? 'ON' : 'OFF'"
          @click="fnSignal"
        ></q-btn>
      </q-item-section>
    </q-item>

    <q-item>
      <q-item-section avatar>
        <q-icon name="svguse:icons.svg#ban" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Block Power Off</q-item-label>
        <q-item-label caption>
          서버에서 컴퓨터 전원을 끄는 것을 차단
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          style="width: 4rem; height: 1rem; border-radius: 0.4rem"
          :color="block ? 'green' : ''"
          :text-color="block ? 'grey-1' : 'grey-10'"
          :label="block ? 'ON' : 'OFF'"
          @click="fnBlock"
        ></q-btn>
      </q-item-section>
    </q-item>

    <q-item>
      <q-item-section avatar>
        <q-icon name="svguse:icons.svg#power-fill" color="red-8" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Power Off</q-item-label>
        <q-item-label caption>Power off the computer</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          style="width: 4rem; height: 1rem; border-radius: 0.4rem"
          icon="power"
          @click="fnPowerOff"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'

export default {
  setup() {
    const { state, commit } = useStore()
    const $q = useQuasar()

    const signal = computed(() => state.setup.signal)
    const block = computed(() => state.setup.block)

    const fnBlock = () => {
      commit('setup/updateBlock', !block.value)
      window.FN.onRequest({ command: 'block', value: block.value })
    }

    const fnSignal = () => {
      commit('setup/updateSignal', !signal.value)
      window.FN.onRequest({ command: 'signal', value: signal.value })
    }

    const fnPowerOff = () => {
      $q.dialog({
        title: 'Power Off',
        message: '현재 시스템을 종료합니다.',
        cancel: true,
        persistent: true
      }).onOk(() => {
        window.FN.onRequest({ command: 'poweroff' })
      })
    }

    return {
      signal,
      block,
      fnBlock,
      fnSignal,
      fnPowerOff
    }
  }
}
</script>
