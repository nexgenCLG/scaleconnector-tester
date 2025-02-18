import { ref, type Ref } from "vue";
import { defineStore } from "pinia";

export const useScaleStore = defineStore("scale", () => {
  
  const weightFromScale = ref(0);
  const infoFromScale = ref(''); //← or →

  const scaleWS: Ref<WebSocket|null> = ref(null);
  
  async function connectToScaleConnector(paramURL: string) {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaW9zdHJlYW1lciJ9.oNx-4e9hldyATpdPZghd_sjX8DhTkQFVDBxIhKh4MC4"

    let url ='ws://';
    console.log('SC URL: ', paramURL)
    paramURL ? url += paramURL : url += 'localhost:8081';
    url += '?token=' + token;
    console.log('SC URL: ', url)
    infoFromScale.value += '\nSC URL: ', url;

    try {
      scaleWS.value = new (WebSocket as any)(url);
      // scaleWS.value = new (WebSocket as any)('ws://172.18.2.249:8081?token=' + token);
      
      scaleWS.value?.addEventListener("open", () => {
        console.log('open connection with SC');
      }) 

      await setScaleWS();
      await startScale();

    } catch(err: any) {
      console.log(err)
      infoFromScale.value += '\n ← Connection error:' + err;
    }

  }

  async function sendConfigToScaleConnector(scaleName: string, scaleConfig: string) {
    console.log('sendConfigToScaleConnector', scaleName, scaleConfig);
    
    const data: any = JSON.stringify({
      message: 'configScale',
      data: {name: scaleName, config: scaleConfig},
    }); 

    scaleWS.value?.send(data)
    infoFromScale.value += '\n → ' + data;
  }


  async function setScaleWS() {
    console.log('set scale WS');
    if (scaleWS.value == null) return;

    // scaleWS.value = ws;
    scaleWS.value!.addEventListener("message", (message: any) => {
      try {
        const response = JSON.parse(message.data);
        infoFromScale.value += "\n ← " + message.data;

        if(response.message == 'status' || response.message == 'auth') {      
          // infoFromScale.value += response.data;
        }

        if(response.message == 'scaleWeight') {      
          console.log('new weight: ', response.data);
          weightFromScale.value = response.data;
        }
      } catch {() => {
        console.log('setScaleWS errror...');
         
      }}
    })
  }
  
  async function startScale() {
    console.log('start scale');
    scaleWS.value?.send(JSON.stringify({
      message: 'startScale',
      data: null,
    }))
  }
  
  async function stopScale() {
    scaleWS.value?.send(JSON.stringify({
      message: 'stopScale',
      data: null,
    }))
  }
  
  function disconnectFromScaleConnector() {
    console.log('stop scale');
    stopScale();
    scaleWS.value?.close();
    scaleWS.value = null;
    infoFromScale.value += '\n ← disconnected'
  }

  async function getWeight() {

    const data: any = JSON.stringify({
      message: 'scaleWeight',
      data: null,
    }); 

    scaleWS.value?.send(data)
    infoFromScale.value += '\n → ' + data;
  }

  async function sendTara() {

    const data: any = JSON.stringify({
      message: 'sendTara',
      data: null,
    }); 

    scaleWS.value?.send(data)
    infoFromScale.value += '\n → ' + data;
  }

  async function sendHandTara(value: number) {

    const data: any = JSON.stringify({
      message: 'sendHandTara',
      data: value,
    }); 

    scaleWS.value?.send(data)
    infoFromScale.value += '\n → ' + data;
  }

  async function sendZero() {

    const data: any = JSON.stringify({
      message: 'sendZero',
      data: null,
    }); 

    scaleWS.value?.send(data)
    infoFromScale.value += '\n → ' + data;
  }

  async function sendBrutto() {

    const data: any = JSON.stringify({
      message: 'sendBrutto',
      data: null,
    }); 
    scaleWS.value?.send(data);
    infoFromScale.value += '\n → ' + data;
  }

  // setInterval(getWeight, 5000);

  function setWeight(newWeight: number) {
    weightFromScale.value = newWeight;
  }

  return { 
    weightFromScale, infoFromScale, 
    startScale, stopScale, setScaleWS, getWeight, 
    sendTara, sendHandTara, sendZero, sendBrutto,
    connectToScaleConnector, disconnectFromScaleConnector, sendConfigToScaleConnector
  };
});
