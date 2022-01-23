<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="row items-center">
          <q-avatar size="md">
            <q-icon
              name="svguse:icons.svg#info-circle"
              color="primary"
              size="1.5rem"
            />
          </q-avatar>
          <div class="text-h6">WOL Client for AMX</div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="q-mx-lg" style="font-size: 0.7rem">
          <div>버젼: {{ packageInfo.version }}</div>
          <div>날짜: 2022-01-23</div>
          <div>License: MIT License</div>
          <div>만든이: jkjh82@naver.com</div>
          <div>
            Electron: {{ packageInfo.devDependencies.electron }}
          </div>
          <div>Quasar: {{ packageInfo.dependencies.quasar }}</div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <div>
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
import { useDialogPluginComponent } from 'quasar'
import packageInfo from '../../package.json'

export default {
  props: {
    user: Object
  },

  emits: [...useDialogPluginComponent.emits],

  setup() {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent()
    return {
      dialogRef,
      onDialogHide,
      packageInfo,
      onOKClick() {
        onDialogOK()
      },
      onCancelClick: onDialogCancel
    }
  }
}
</script>
