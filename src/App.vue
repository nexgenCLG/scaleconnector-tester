<script setup lang="ts">
  import { IonApp, IonCol, IonLabel, IonGrid, IonRow, IonButton, IonContent, IonInput, IonTextarea } from '@ionic/vue';
  import { ref, type Ref} from "vue";
  import { storeToRefs } from 'pinia';

  import { useScaleStore } from "@/stores/scale";
  const { weightFromScale, infoFromScale } = storeToRefs(useScaleStore());

  const { connectToScaleConnector, disconnectFromScaleConnector, getWeight, sendTara, sendHandTara, sendBrutto, sendZero } = useScaleStore();

  const url: Ref<string> = ref('localhost:8081');
  const seconds: Ref<number> = ref(5);
  const tara: Ref<number> = ref(0);

  function startScaleConnection() {
    connectToScaleConnector(url.value);
  }

  function stopScaleConnection() {
    stopGettingWeightInterval();
    disconnectFromScaleConnector();
  }

  function getWeightFromScale() {
    console.log('call scaleWeight');
    getWeight();
  }

  function getOneWeightFromScale() {
    stopGettingWeightInterval();
    getWeightFromScale();
  }

  function getManyWeightFromScale() {
    startGettingWeightInterval();
  }

  // 

  let intervalId: number | null = null;
  function startGettingWeightInterval() {
    if (!intervalId) {
      intervalId = window.setInterval(getWeightFromScale, seconds.value  * 1000);
    }
  }

  function stopGettingWeightInterval() {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
      weightFromScale.value = 0;
    }
  }

</script>

<template>
  <ion-app>
    <ion-content class="main-appcontent " id="main-content">

      <ion-grid class="ion-padding-start ion-padding-end justify-content-left align-items-left">

        <ion-row class="full-height">
          <ion-col size="6">
            <ion-label>
              <h1> Scale connector </h1>
            </ion-label>
            <ion-row class="full-height">
              <ion-col>
                <ion-input label="Scale Connector URL (IP:port)" v-model="url" label-placement="stacked" fill="outline"></ion-input>
              </ion-col>
              <ion-col>
                <ion-button @click="startScaleConnection">Connect</ion-button>
                <ion-button @click="stopScaleConnection">Stop</ion-button>
              </ion-col>
            </ion-row>
            <ion-row class="full-height">
              <ion-col>
                <ion-button @click="getOneWeightFromScale">Get weight (1 call)</ion-button>
              </ion-col>
            </ion-row>
            <ion-row class="full-height">
              <ion-col>
                <ion-button @click="getManyWeightFromScale">Get weight (loop)</ion-button>
              </ion-col>
              <ion-col>
                <ion-input label="Seconds" v-model="seconds" label-placement="stacked" fill="outline"></ion-input>
              </ion-col>
              <ion-col>
                <ion-input label="RECEIVED weight:" v-model="weightFromScale" label-placement="stacked" fill="outline"></ion-input>
              </ion-col>
            </ion-row>
            <ion-row class="full-height">
              <ion-col>
                <ion-button @click="sendTara">Send Tara</ion-button>
              </ion-col>
            </ion-row>
            <ion-row class="full-height">
              <ion-col>
                <ion-button @click="sendHandTara(tara)">Send Hand Tara</ion-button>
              </ion-col>
              <ion-col>
                <ion-input label="Tara" v-model="tara" label-placement="stacked" fill="outline"></ion-input>
              </ion-col>
            </ion-row>
            <ion-row class="full-height">
              <ion-col>
                <ion-button @click="sendZero">Send Zero</ion-button>
              </ion-col>
            </ion-row>
            <ion-row class="full-height">
              <ion-col>
                <ion-button @click="sendBrutto">Send Brutto</ion-button>
              </ion-col>
            </ion-row>

          </ion-col>
          <ion-col size="6" style="max-width: 600px;">
            <ion-row class="full-height">
              <ion-col>
                <ion-textarea label="Status:" v-model="infoFromScale" label-placement="stacked" fill="outline" style="min-height: 80vh"></ion-textarea>
              </ion-col>
            </ion-row>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-app>
</template>

<style scoped>
 
  .main-appcontent {
    height: 100vh;
  }

  ion-row {
    justify-content: flex-start; /* Align columns to the left */
  }
  ion-col {
    /* flex: 0 0 auto; Prevent columns from shrinking */
    /* min-width: 150px; Set the minimum width for the column */
    /* max-width: 300px; Optional: Limit the maximum width */
  }

</style>
