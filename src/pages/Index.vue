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
</template>

<script>
import { defineComponent, ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'

import FunctionList from '../components/list'
import SelectNic from '../components/nic'
import InfoDialog from '../components/infoDialog.vue'
import PowerDialog from '../components/powerDialog.vue'

export default defineComponent({
  name: 'PageIndex',
  components: { FunctionList, SelectNic },
  setup() {
    const { commit } = useStore()
    const $q = useQuasar()
    const sync = ref(false)
    const syncTimer = ref(null)

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

            case 'network':
              commit('nic/updateSelected', item.value)
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
            case 'sync':
              clearTimeout(syncTimer.value)
              sync.value = true
              syncTimer.value = setTimeout(() => {
                sync.value = false
              }, 9000)

              break
            case 'nics':
              commit('nic/updateNics', args.value)
              break

            case 'setup':
              setupParcing(args.value)
              break

            case 'info':
              $q.dialog({
                component: InfoDialog
              })
              break

            case 'checkpower':
              $q.dialog({
                component: PowerDialog
              }).onOk(() => {
                console.log('power off')
              })
              break

            case 'factory_reset':
              $q.dialog({
                title: '공장 초기화',
                message: '어플 설정을 초기상태로 되돌립니다.',
                cancel: true,
                persistent: true
              }).onOk(async () => {
                console.log('reset')
              })
            default:
              console.log(args)
              break
          }
        } catch (e) {
          console.error(e)
        }
      })

      window.FN.onRequest({ command: 'getsetup' })
    })
    return {
      sync
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
