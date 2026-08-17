import { ref, type Ref } from "vue";
import { defineStore } from "pinia";

export const useScaleStore = defineStore("scale", () => {
  
  const clientWebSocket: Ref<WebSocket|null> = ref(null);
  const weightFromScale = ref(0);
  const scErrorCode = ref(''); // ERROR, ERROR_CONFIG, ERROR_CONN, ERROR_CONN_SCALE, ERROR_READ_WEIGHT
  const infoFromScale = ref(''); //← or →

  const isScaleConnected = ref(false);
  
  async function connectToScaleConnector(paramURL: string, scaleName: string, scaleConfig: string) {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaW9zdHJlYW1lciJ9.oNx-4e9hldyATpdPZghd_sjX8DhTkQFVDBxIhKh4MC4"
    const URL = 'ws://' + paramURL + '?token=' + token;

    infoFromScale.value += '\nSC URL: ' + 'ws://' + paramURL;

    try {
      scErrorCode.value = '';
      
      if (!clientWebSocket.value) {
        
        clientWebSocket.value = new (WebSocket as any)(URL);
              
        clientWebSocket.value?.addEventListener("open", () => {
          console.log('SC WebSocket Open connection with scale connector');
          startScale();
        });

        clientWebSocket.value?.addEventListener("message", (message: any) => {
          console.log("SC WebSocket message: ", message.data);
          infoFromScale.value += "\n ← " + message.data;
         
          if (!message.data.includes('message')) return; // Skip simple text
         
          handleScaleConnectorMessage(message, scaleName, scaleConfig);
        });

        clientWebSocket.value?.addEventListener("error", (error: any) => {
          console.error('SC WebSocket error: ', error);
          scErrorCode.value = 'ERROR_CONN';
        });
      } 

    } catch(err: any) {
      console.error('SC connectToScaleConnector(): ' + err);
      scErrorCode.value = 'ERROR';
      infoFromScale.value += '\n ← Connection error:' + err;
    }

  }

  async function disconnectFromScaleConnector(): Promise<void> {
    console.log("SC Stopping scale...");
    stopScale();
  
    isScaleConnected.value = false;
    
    if (!clientWebSocket.value) return;
  
    return new Promise((resolve) => {
      clientWebSocket.value!.addEventListener("close", () => {
        console.log("SC WebSocket disconnected");
        clientWebSocket.value = null;
        infoFromScale.value += '\n → client disconnected'
        resolve();
      });
  
      if (clientWebSocket.value?.readyState !== WebSocket.CLOSED && clientWebSocket.value?.readyState !== WebSocket.CLOSING) {
        clientWebSocket.value?.close();
        infoFromScale.value += '\n → client not close => forced to close';
      } else {
        clientWebSocket.value = null;
        resolve();
      }
    });
    // console.log('stop scale');
    // stopScale();
    // clientWebSocket.value?.close();
    // clientWebSocket.value = null;
  }

  async function handleScaleConnectorMessage(message: any, scaleName: string, scaleConfig: string) {

    const response = JSON.parse(message.data);

    try {

      if (response.message === 'status') {
        if (response.data === 'connection ok') {
          sendConfigToScaleConnector(scaleName, scaleConfig);
          if (scaleName.startsWith('Test')) isScaleConnected.value = true;//to be removed
        } else {
          isScaleConnected.value = false;
          scErrorCode.value = 'ERROR_CONN';
        }
        return;
      }

      if (response.message === 'configScale'){
        if (response.data === 'OK') {
          isScaleConnected.value = true;
        } else {
          isScaleConnected.value = false;
          scErrorCode.value = 'ERROR_CONFIG';
        }
        return; 
      }

      if (response.message === 'scaleWeight') {
        // "failed"
        // "ERROR: COM connection failed"
        // "ERROR: TCP connection failed"
        // "ERROR: can not read weight in kg:"
        // "ERROR: can not read weight in g:"

        if (response.data.includes('ERROR') || response.data.includes('failed')) {
          scErrorCode.value = 'ERROR';
          if (response.data.includes('COM') || response.data.includes('TCP')) {
            scErrorCode.value = 'ERROR_CONN_SCALE';
          } else if (response.data.includes('read weight')) {
            scErrorCode.value = 'ERROR_READ_WEIGHT';
          }
          isScaleConnected.value = false;
        
        } else if (isNaN(Number(response.data))) {
          weightFromScale.value = 0;
        } else {
          weightFromScale.value = response.data;
        }
      }
  
    } catch (error) {
      console.error('SC handleScaleConnectorMessage:', error);
      scErrorCode.value = 'ERROR';
    }
  }

  async function startScale() {
    console.log('start scale');
    clientWebSocket.value?.send(JSON.stringify({
      message: 'startScale',
      data: null,
    }))
    infoFromScale.value += '\n → startScale sent' ;
  }
  
  async function stopScale() {
    clientWebSocket.value?.send(JSON.stringify({
      message: 'stopScale',
      data: null,
    }))
    infoFromScale.value += '\n → stopScale sent' ;
  }  


  async function sendConfigToScaleConnector(scaleName: string, scaleConfig: string): Promise<string> {
    console.log('sendConfigToScaleConnector', scaleName, scaleConfig);
    
    return new Promise(() => {
      const data: any = JSON.stringify({
        message: 'configScale',
        data: {name: scaleName, config: scaleConfig},
      }); 
      clientWebSocket.value?.send(data);
      infoFromScale.value += '\n → ' + data;
    });
  }


  // async function setScaleWS() {
  //   console.log('set scale WS');
  //   if (clientWebSocket.value == null) return;

  //   // scaleWS.value = ws;
  //   clientWebSocket.value!.addEventListener("message", (message: any) => {
  //     try {
  //       const response = JSON.parse(message.data);
  //       infoFromScale.value += "\n ← " + message.data;

  //       if(response.message == 'status' || response.message == 'auth') {      
  //         // infoFromScale.value += response.data;
  //       }

  //       if(response.message == 'scaleWeight') {      
  //         console.log('new weight: ', response.data);
  //         weightFromScale.value = response.data;
  //       }
  //     } catch {() => {
  //       console.log('setScaleWS errror...');
         
  //     }}
  //   })
  // }
  

  


  async function getWeight() {

    const data: any = JSON.stringify({
      message: 'scaleWeight',
      data: null,
    }); 

    clientWebSocket.value?.send(data)
    infoFromScale.value += '\n → ' + data;
  }

  async function sendTara() {

    const data: any = JSON.stringify({
      message: 'sendTara',
      data: null,
    }); 

    clientWebSocket.value?.send(data)
    infoFromScale.value += '\n → ' + data;
  }

  async function sendHandTara(value: number) {

    const data: any = JSON.stringify({
      message: 'sendHandTara',
      data: value,
    }); 

    clientWebSocket.value?.send(data)
    infoFromScale.value += '\n → ' + data;
  }

  async function sendZero() {

    const data: any = JSON.stringify({
      message: 'sendZero',
      data: null,
    }); 

    clientWebSocket.value?.send(data)
    infoFromScale.value += '\n → ' + data;
  }

  async function sendBrutto() {

    const data: any = JSON.stringify({
      message: 'sendBrutto',
      data: null,
    }); 
    clientWebSocket.value?.send(data);
    infoFromScale.value += '\n → ' + data;
  }

  // setInterval(getWeight, 5000);

  function setWeight(newWeight: number) {
    weightFromScale.value = newWeight;
  }

  return { 
    weightFromScale, infoFromScale, isScaleConnected, scErrorCode,
    startScale, stopScale, 
    // setScaleWS, 
    getWeight, 
    sendTara, sendHandTara, sendZero, sendBrutto,
    connectToScaleConnector, disconnectFromScaleConnector, sendConfigToScaleConnector
  };
});
