<script setup lang="ts">
  import { IonApp, IonCol, IonItem, IonLabel, IonGrid, IonRow, IonButton, IonContent, IonInput, IonTextarea } from '@ionic/vue';
  import { ref, type Ref} from "vue";
  import { storeToRefs } from 'pinia';

  import { useScaleStore } from "@/stores/scale";
  const { weightFromScale, infoFromScale } = storeToRefs(useScaleStore());

  const { connectToScaleConnector, disconnectFromScaleConnector, getWeight } = useScaleStore();

  const url: Ref<string> = ref('localhost:8082');
  const seconds: Ref<number> = ref(5);

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
    <ion-content class="main-appcontent" id="main-content">
      
      <ion-grid class="ion-padding-start ion-padding-end full-height" >
      
      <ion-row class="full-height">
        <ion-col>
          <ion-item>
            <ion-label>
              <h1> Scale connector </h1>
            </ion-label>
          </ion-item>
        </ion-col>
       </ion-row>
       <ion-row class="full-height">
        <ion-col size="3">
          <ion-input label="Scale Connector URL (IP:port)" v-model="url" label-placement="stacked" fill="outline"></ion-input>
        </ion-col>
        <ion-col size="1">
          <ion-button @click="startScaleConnection">Start</ion-button> 
        </ion-col>
        <ion-col size="4">
          <ion-textarea label="Status:" v-model="infoFromScale" label-placement="stacked" fill="outline"></ion-textarea>
        </ion-col>
      </ion-row>
      <ion-row class="full-height">
        <ion-col size="3">
          <ion-button @click="getOneWeightFromScale">Get weight (1 call)</ion-button> 
        </ion-col>
       </ion-row>
       <ion-row class="full-height">
        <ion-col size="2">
          <ion-button @click="getManyWeightFromScale">Get weight (loop)</ion-button> 
        </ion-col>
        <ion-col size="1">
          <ion-input label="Seconds" v-model="seconds" label-placement="stacked" fill="outline"></ion-input>
        </ion-col>
        <ion-col  size="2">
          <ion-input label="RECEIVED weight:" v-model="weightFromScale" label-placement="stacked" fill="outline"></ion-input>
        </ion-col>
       </ion-row>
       <ion-row class="full-height">
       </ion-row>
       <ion-row class="full-height">
        <ion-col>
          <ion-col size="1">
          <ion-button @click="stopScaleConnection">Stop</ion-button> 
        </ion-col>
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
  
  .split-pane-content {
    padding-top: 56px;
  }
  .app-title { 
    font-size: x-large;
    font-weight: bold;
  }

  .row-border {
    border-color: white;
    border-bottom:  grey 5px;    
    border-width: .01em; 
    border-style: solid;
  }
</style>

<style>
  #app {
    height: 100%;
  }
</style>