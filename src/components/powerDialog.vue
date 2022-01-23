<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
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
        <div class="row justify-center">
          <div>
            <span>시스템이 </span>
            <span class="text-red text-h6"
              ><strong>{{ sec }}</strong></span
            >
            <span>초 후에 종료됩니다.</span>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <div class="q-gutter-x-md">
          <q-btn
            label="취소"
            flat
            color="red"
            @click="onCancelClick"
          />
          <q-btn
            color="primary"
            flat
            label="즉시종료"
            @click="onOKClick()"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useDialogPluginComponent } from 'quasar'

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
        if (sec.value === 0) {
          clearInterval(timer.value)
          sec.value = 5
          onDialogOK()
        }
        sec.value -= 1
      }, 1000)
    })

    function onOKClick() {
      clearInterval(timer.value)
      onDialogOK()
    }

    function onCancelClick() {
      clearInterval(timer.value)
      window.FN.onRequest({ command: 'blockpoweroff' })
      onDialogCancel()
    }

    return {
      sec,
      dialogRef,
      onDialogHide,
      onOKClick,
      onCancelClick
    }
  }
}
</script>
