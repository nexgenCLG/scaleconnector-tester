import { ref, type Ref } from "vue";
import { defineStore } from "pinia";

export const useScaleStore = defineStore("scale", () => {
  const weightFromScale = ref(0);
  const scaleWS: Ref<WebSocket|null> = ref(null);
  
  // const ws: Ref<WebSocket|null> = ref(null)


  async function connectToScaleConnector() {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaW9zdHJlYW1lciJ9.oNx-4e9hldyATpdPZghd_sjX8DhTkQFVDBxIhKh4MC4"
    scaleWS.value = new (WebSocket as any)('ws://localhost:8081?token=' + token);
    // scaleWS.value = new (WebSocket as any)('ws://172.18.2.249:8081?token=' + token);
    
    scaleWS.value?.addEventListener("open", () => {
      console.log('start scale');
      
      startScale(null).then(() => {
        
        setScaleWS();
      })
    })
  }

  function setScaleWS() {

    if (scaleWS.value == null) return;

    // scaleWS.value = ws;
    scaleWS.value!.addEventListener("message", (message: any) => {
      try {
        const response = JSON.parse(message.data);
        if(response.message == 'scaleWeight') {      
          console.log('new weight: ', response.data);
          weightFromScale.value = response.data;

          console.log('new weightFromScale: ', weightFromScale.value);
        }
      } catch {() => {
        console.log('setScaleWS errror...');
         
      }}
    })
  }
  
  async function startScale(scaleConfig: any) {
    scaleWS.value?.send(JSON.stringify({
      message: 'startScale',
      value: { path: 'COM5', baudRate: 2400, dataBits: 7, stopBits: 1, parity: 'even' },
    }))
  }
  
  async function stopScale() {
    scaleWS.value?.send(JSON.stringify({
      message: 'stopScale',
      value: null,
    }))
  }
  


  function disconnectFromScaleConnector() {
    console.log('stop scale');
    stopScale();
    scaleWS.value?.close();
    scaleWS.value = null;
  }

  async function getWeight() {

    scaleWS.value?.send(JSON.stringify({
      message: 'scaleWeight',
      value: null,
    }))
    setScaleWS();
  }

  // setInterval(getWeight, 5000);

  function setWeight(newWeight: number) {
    weightFromScale.value = newWeight;
  }

  return { weightFromScale, startScale, stopScale, setScaleWS, getWeight, connectToScaleConnector, disconnectFromScaleConnector };
});
