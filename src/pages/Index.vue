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
            v-show="!sync"
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
                    @click="fnSendCommand('signal')"
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
                    @click="fnSendCommand('block')"
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
                    @click="fnTimerPowerOffStart"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <!-- select nic -->
          <q-card-section>
            <div class="q-mx-md">
              <q-select
                v-model="selected"
                stack-label
                borderless
                label="Network Interface"
                :options="nics"
                @update:model-value="fnUpdateNetworkInterface"
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

  <q-dialog v-model="mdPowerOff">
    <div class="fit shadow-0 progress">
      <q-circular-progress
        class="text-white"
        show-value
        :value="count"
        indeterminate
        size="150px"
        color="grey-8"
      />
      <div class="btns">
        <q-btn class="btn" @click="fnClearTimerPowerOff">취소</q-btn>
        <q-btn class="btn" color="negative" @click="fnPowerOff">즉시끄기</q-btn>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, onBeforeMount } from 'vue'

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const signal = ref(false)
    const sync = ref(false)
    const block = ref(false)
    const nics = ref(null)
    const selected = ref(null)
    const mdPowerOff = ref(false)
    const counter = ref(null)
    const count = ref(5)
    const timeout = ref(10)

    function fnSyncTimeout() {
      setInterval(() => {
        if (timeout.value <= 0) {
          timeout.value = 10
          sync.value = false
        } else {
          timeout.value = timeout.value - 1
        }
      }, 1000)
    }

    function fnTimerPowerOffStart() {
      // window.powerOff.request()
      mdPowerOff.value = true
      counter.value = setInterval(timerPowerOff, 1000)
    }

    function fnPowerOff() {
      window.powerOff.request()
    }

    function fnClearTimerPowerOff() {
      clearInterval(counter.value)
      mdPowerOff.value = false
    }

    function timerPowerOff() {
      if (count.value !== 0) {
        count.value = count.value - 1
      } else {
        clearInterval(counter.value)
        fnPowerOff()
      }
    }

    function fnSendCommand(key) {
      switch (key) {
        case 'signal':
          signal.value = !signal.value
          window.Fn.set({ key: 'signal', value: signal.value })
          break
        case 'block':
          block.value = !block.value
          window.Fn.set({ key: 'block', value: block.value })
          break
      }
    }

    function fnUpdateNetworkInterface() {
      window.nic.set({ ...selected.value })
    }

    onBeforeMount(() => {
      window.nic.onResponse((data) => {
        nics.value = data
      })
      window.Fn.onResponse((data) => {
        let hasNetworkInfo = false
        data.forEach((item) => {
          switch (item.section) {
            case 'networkInterface':
              selected.value = {
                name: item.name,
                address: item.address,
                mac: item.mac,
              }
              hasNetworkInfo = true
              break
            case 'block':
              block.value = item.value
              window.Fn.set({ key: 'block', value: block.value })
              break
            case 'signal':
              signal.value = item.value
              window.Fn.set({ key: 'signal', value: signal.value })
              break
            case 'sync':
              sync.value = true
              timeout.value = 10
              break
          }
          if (!hasNetworkInfo) {
            const networkInterface = {
              name: nics.value[0].name,
              address: nics.value[0].address,
              mac: nics.value[0].mac,
            }
            selected.value = networkInterface
            fnUpdateNetworkInterface()
          }
        })
      })
      fnSyncTimeout()
      window.Fn.get()
      window.nic.request()
    })
    return {
      selected,
      signal,
      sync,
      block,
      nics,
      count,
      mdPowerOff,
      fnPowerOff,
      fnTimerPowerOffStart,
      fnClearTimerPowerOff,
      fnSendCommand,
      fnUpdateNetworkInterface,
    }
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
.progress {
  position: absolute;
  overflow: visible;
  top: 50%;
  left: 50%;
  margin: -80px 0 0 -75px;
}
.btns {
  position: relative;
  overflow: visible;
  top: 10%;
  margin: 0 -65px;
}
.btn {
  width: 100px;
  height: 42px;
  background: #fff;
  margin: 0 20px;
  font-weight: 700;
  border: none;
  border-radius: 5px;
  box-shadow: 0 0 1rem 1rem grey;
}
</style>
