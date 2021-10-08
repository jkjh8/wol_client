<template>
  <q-page>
    <div style="padding: 10% 10%">
      <div class="row items-center">
        <q-icon name="svguse:icons.svg#view-grid" size="lg" color="green" />
        <div class="q-ml-sm">
          <div class="listname">WOL 클라이언트</div>
          <div class="caption">시스템 상태 표시 및 설정</div>
        </div>
      </div>
      <div class="q-mt-xl">
        <q-card class="shadow-15" style="border-radius: 1rem">
          <q-card-section>
            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="svguse:icons.svg#adjustments" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Signal</q-item-label>
                  <q-item-label caption
                    >Send devices address to server</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    style="width: 4rem; height: 1rem; border-radius: 0.4rem"
                    :color="signal ? 'green' : ''"
                    :text-color="signal ? 'grey-1' : 'grey-10'"
                    :label="signal ? 'ON' : 'OFF'"
                    @click="signal = !signal"
                  ></q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const signal = ref(false)
    return { signal }
  },
})
</script>

<style scoped>
.listname {
  font-size: 1rem;
  font-weight: 700;
}
.caption {
  font-size: 0.8rem;
  font-weight: 400;
}
</style>
