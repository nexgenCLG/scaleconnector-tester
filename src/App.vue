<script setup lang="ts">
  import { IonApp, IonCol, IonLabel, IonGrid, IonRow, IonButton, IonContent, IonInput, IonTextarea } from '@ionic/vue';
  import { ref, type Ref, watch} from "vue";
  import { storeToRefs } from 'pinia';

  import { useScaleStore } from "@/stores/scale";
  const { weightFromScale, infoFromScale, isScaleConnected, scErrorCode } = storeToRefs(useScaleStore());

  import { usePrintingStore } from '@/stores/printing';
  const { saveAsPDF } = usePrintingStore();

  const { connectToScaleConnector, disconnectFromScaleConnector, sendConfigToScaleConnector, getWeight, sendTara, sendHandTara, sendBrutto, sendZero } = useScaleStore();

  const url: Ref<string> = ref('localhost:8081');
  const scaleName: Ref<string> = ref('PB8000');
  const scaleConfig: Ref<string> = ref("{'path': 'COM1', 'baudRate': 2400, 'dataBits': 7, 'stopBits': 1, 'parity': 'even'}");
  const seconds: Ref<number> = ref(5);
  const tara: Ref<number> = ref(0);

  const urlPrinting: Ref<string> = ref('localhost:3000');

  function startScaleConnection() {
    connectToScaleConnector(url.value, scaleName.value, scaleConfig.value);
  }

  function stopScaleConnection() {
    stopGettingWeightInterval();
    disconnectFromScaleConnector();
  }

  // function sendConfig() {
  //   sendConfigToScaleConnector(scaleName.value, scaleConfig.value);
  // }

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

    watch(scErrorCode, (newValue) => {
    if (newValue) {
      scErrorCode.value = ''; 
      infoFromScale.value += '\n(scErrorCode reseted, stop interval, disconnect from scale)\n'; 
    
      if (!isScaleConnected.value) {
        stopGettingWeightInterval();
        disconnectFromScaleConnector();
      }
    }
  });

  function sendPDF() {
    const popoverContent = document.getElementById('printContent')!.outerHTML;
    const fileName = 'Test.pdf';
    
    saveAsPDF(fileName, popoverContent, urlPrinting.value).then(() => {
      console.log("PDF saved successfully.");
    }).catch((errorCode) => {
      alert(errorCode.includes('CREATE') ? 'Error creating file: ' + errorCode.message : 'Error sending file: ' + errorCode.message);
    });

  }

</script>

<template>
  <ion-app>
    <ion-content class="main-appcontent" id="main-content">

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
            </ion-row>
            <ion-row class="full-height">
              <ion-col  size="2">
                <ion-input label="Scale Name" v-model="scaleName" label-placement="stacked" fill="outline"></ion-input>
              </ion-col>
              <ion-col  size="8">
                <ion-input label="Scale Config" v-model="scaleConfig" label-placement="stacked" fill="outline"></ion-input>
              </ion-col>
              <ion-col>
                <!-- <ion-button @click="sendConfig">Send Config</ion-button> -->
              </ion-col>
            </ion-row>
            <ion-row class="full-height">
              <ion-col>
                <ion-button @click="startScaleConnection">Connect</ion-button>
                <ion-button @click="stopScaleConnection">Stop</ion-button>
              </ion-col>
            </ion-row>
            <br/><hr/>
            <ion-row class="full-height">
              <ion-col  size="4">
                <ion-button @click="getOneWeightFromScale">Get weight (1 call)</ion-button>
              </ion-col>
            </ion-row>
            <ion-row class="full-height">
              <ion-col size="3">
                <ion-button @click="getManyWeightFromScale">Get weight (loop)</ion-button>
              </ion-col>
              <ion-col size="2">
                <ion-input label="Seconds" v-model="seconds" label-placement="stacked" fill="outline"></ion-input>
              </ion-col>
              <ion-col size="4">
                <ion-input label="RECEIVED weight:" v-model="weightFromScale" label-placement="stacked" fill="outline"></ion-input>
              </ion-col>
              <ion-col size="2"> </ion-col>
            </ion-row>
            <br/><hr/>
            <ion-row class="full-height">
              <ion-col>
                <ion-button @click="sendTara">Send Tara</ion-button>
              </ion-col>
            </ion-row>
            <ion-row class="full-height">
              <ion-col  size="3">
                <ion-button @click="sendHandTara(tara)">Send Hand Tara</ion-button>
              </ion-col>
              <ion-col  size="2">
                <ion-input label="Tara" v-model="tara" label-placement="stacked" fill="outline"></ion-input>
              </ion-col>
              
            </ion-row>
            <br/><hr/>
            <ion-row class="full-height">
              <ion-col>
                <ion-button @click="sendZero">Send Zero</ion-button>
              </ion-col>
              <ion-col>
                <ion-button @click="sendBrutto">Send Brutto</ion-button>
              </ion-col>
            </ion-row>
            <ion-row class="full-height">
            </ion-row>
          </ion-col>
          
          <ion-col size="6" style="max-width: 600px;">
            <ion-row class="full-height">
              <ion-col size="2">
                <ion-button @click="infoFromScale=''">Clear</ion-button>
              </ion-col>
            </ion-row>
            <ion-row class="full-height">
              <ion-col>
                <ion-textarea label="Status:" v-model="infoFromScale" label-placement="stacked" fill="outline" style="min-height: 80vh"></ion-textarea>
              </ion-col>
            </ion-row>
          </ion-col>
        </ion-row>
        <br/><hr/>
        <ion-row class="full-height">
          <ion-col  size="4">
            <ion-label><h1> Automatic printing</h1></ion-label>
          </ion-col>
          <ion-col  size="4">
            <ion-input label="Printing service (IP:port)" v-model="urlPrinting" label-placement="stacked" fill="outline"></ion-input>
          </ion-col>
          <ion-col >
            <ion-button @click="sendPDF">Send PDF</ion-button>
          </ion-col>
          <ion-col size="3"></ion-col>
        </ion-row>
        <ion-row id="printContent">
          <ion-label>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</ion-label>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-app>
</template>

<style scoped>
 
  .main-appcontent {
    height: 100vh;
    /* width: 80%; */
  }

  ion-row {
    justify-content: flex-start; /* Align columns to the left */
  }
</style>
