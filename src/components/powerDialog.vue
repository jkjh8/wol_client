<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="row items-center">
          <q-avatar size="md">
            <q-icon
              name="svguse:icons.svg#power-fill"
              color="red"
              size="1.5rem"
            />
          </q-avatar>
          <div class="text-h6">시스템이 종료 됩니다.</div>
        </div>
      </q-card-section>

      <q-card-section>
        <div>
          <span>시스템이 </span>
          <span>{{ sec }}</span>
          <span>초 후에 종료됩니다.</span>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <div>
          <q-btn
            label="취소"
            flat
            color="red"
            @click="onCancelClick"
          />
          <q-btn
            color="primary"
            flat
            label="확인"
            @click="onOKClick()"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { useDialogPluginComponent, ref, onMounted } from 'quasar'

export default {
  props: {
    user: Object
  },

  emits: [...useDialogPluginComponent.emits],

  setup() {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent()

    const sec = ref(5)
    const timer = ref(null)
    onMounted(() => {
      timer.value = setInterval(() => {
        if (sec === 0) {
          clearInterval(timer.value)
          sec.value = 5
          onDialogOK()
        }
        sec -= 1
      }, 1000)
    })

    function onCancelClick() {
      clearInterval(timer.value)
      window.FN.onRequest({ command: 'blockpoweroff' })
      onDialogCancel()
    }

    return {
      sec,
      dialogRef,
      onDialogHide,
      packageInfo,
      onOKClick() {
        onDialogOK()
      },
      onCancelClick
    }
  }
}
</script>
