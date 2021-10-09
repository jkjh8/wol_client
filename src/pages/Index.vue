<template>
  <q-page>
    <div style="padding: 10% 10%">
      <div class="row justify-between items-center">
        <div class="row items-center">
          <q-icon name="svguse:icons.svg#view-grid" size="lg" color="green" />
          <div class="q-ml-sm">
            <div class="listname">WOL 클라이언트</div>
            <div class="caption">시스템 상태 표시 및 설정</div>
          </div>
        </div>

        <div class="q-mr-sm">
          <q-icon
            name="svguse:icons.svg#exclamation"
            size="md"
            color="red"
          ></q-icon>
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
                    >컴퓨터 디바이스 정보를 서버로 전송</q-item-label
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
                    @click="block = !block"
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
          </q-card-section>
          <q-card-section>
            <div class="q-mx-md">
              <q-select
                v-model="selected"
                stack-label
                borderless
                label="Network Interface"
                :options="nics"
              >
                <template v-slot:selected-item="scope">
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

                <template v-slot:option="scope">
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
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onBeforeMount } from 'vue'

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const signal = ref(false)
    const block = ref(false)
    const nics = ref(null)
    const selected = ref(null)

    function fnPowerOff() {
      window.powerOff.request()
    }

    onBeforeMount(() => {
      window.nic.onResponse((data) => {
        console.log(data)
        nics.value = data
      })
      window.nic.request()
    })
    return { selected, signal, block, nics, fnPowerOff }
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
