<template>
  <q-page>
    <div style="padding: 10% 10% 0 10%">
      <div class="row justify-between items-center">
        <div class="row items-center">
          <q-icon
            name="svguse:icons.svg#view-grid"
            size="lg"
            color="green"
          />
          <div class="q-ml-sm">
            <div class="listname">WOL 클라이언트</div>
            <div class="caption">시스템 상태 표시 및 설정</div>
          </div>
        </div>

        <div class="q-mr-sm">
          <q-icon
            v-if="!sync"
            name="svguse:icons.svg#exclamation"
            size="md"
            color="red"
          >
          </q-icon>
          <q-icon
            v-else
            name="svguse:icons.svg#check-circle"
            size="md"
            color="green"
          />
        </div>
      </div>
      <div class="q-mt-xl">
        <q-card class="shadow-15" style="border-radius: 1rem">
          <q-card-section>
            <FunctionList />
          </q-card-section>

          <!-- select nic -->
          <q-card-section>
            <SelectNic />
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
        <q-btn class="btn" color="negative" @click="fnPowerOff"
          >즉시끄기</q-btn
        >
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import FunctionList from '../components/list'
import SelectNic from '../components/nic'

export default defineComponent({
  name: 'PageIndex',
  components: { FunctionList, SelectNic },
  setup() {
    const { commit } = useStore()

    const setupParcing = (setup) => {
      try {
        setup.forEach((item) => {
          switch (item.section) {
            case 'block':
              commit('setup/updateBlock', item.value)
              break

            case 'signal':
              commit('setup/updateSignal', item.value)
              break
          }
        })
      } catch (e) {
        console.error(e)
      }
    }

    onBeforeMount(() => {
      window.FN.onResponse((args) => {
        try {
          switch (args.command) {
            case 'nics':
              console.log(args)
              commit('nic/updateNics', args.value)
              break

            case 'setup':
              setupParcing(args.value)
              break

            default:
              console.log(args)
              break
          }
        } catch (e) {
          console.error(e)
        }
      })
      window.FN.onRequest({ command: 'getsetup' })
      // window.Fn.onResponse((data) => {
      //   data.forEach((item) => {
      //     switch (item.section) {
      //       case 'networkInterface':
      //         selected.value = {
      //           name: item.name,
      //           address: item.address,
      //           mac: item.mac,
      //         }
      //         console.log(item)
      //         break
      //       case 'block':
      //         block.value = item.value
      //         window.Fn.set({ key: 'block', value: block.value })
      //         break
      //       case 'signal':
      //         signal.value = item.value
      //         window.Fn.set({ key: 'signal', value: signal.value })
      //         break
      //       case 'sync':
      //         sync.value = true
      //         timeout.value = 10
      //         break
      //     }
      //     console.log(nics.value[0] === selected.value)
      //     if (nics.value.includes(selected.value)) {
      //       console.log('not has ')
      //       const networkInterface = {
      //         name: nics.value[0].name,
      //         address: nics.value[0].address,
      //         mac: nics.value[0].mac,
      //       }
      //       selected.value = networkInterface
      //       fnUpdateNetworkInterface()
      //     }
      //   })
      // })
    })
    return {
      //
    }
  }
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
