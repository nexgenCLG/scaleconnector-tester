<script setup lang="ts">
  import { IonCol, IonItem, IonLabel, IonGrid, IonRow, IonButton, IonInput } from '@ionic/vue';
  import { RouterLink, RouterView } from 'vue-router'
  import HelloWorld from './components/HelloWorld.vue'

  import { storeToRefs } from 'pinia';

  import { useScaleStore } from "@/stores/scale";
  const { weightFromScale } = storeToRefs(useScaleStore());

  const { connectToScaleConnector, disconnectFromScaleConnector, getWeight } = useScaleStore();

  function startScaleConnection() {
    connectToScaleConnector();
  }

  function stopScaleConnection() {
    disconnectFromScaleConnector();
  }

  function getWeightFromScale() {
    console.log('call scaleWeight');
    getWeight();
  }


</script>

<template>
  <ion-app>
    <ion-content class="main-appcontent" id="main-content">
      
      <ion-grid class="ion-padding-start ion-padding-end full-height" >
      
      <ion-row class="full-height">
        <ion-item>
          <ion-label>
            <h1> Scale connector </h1>
          </ion-label>
        </ion-item>
       </ion-row>
       <ion-row class="full-height">
        <ion-item>
           <ion-button @click="startScaleConnection">Start</ion-button> 
           <ion-button @click="getWeightFromScale">Get weight</ion-button> 
           <ion-button @click="stopScaleConnection">Stop</ion-button> 
          </ion-item>
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