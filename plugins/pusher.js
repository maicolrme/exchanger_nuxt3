// plugins/pusher.js
import Pusher from 'pusher-js';

export default defineNuxtPlugin(() => {
  // Configuración de Pusher
  Pusher.logToConsole = process.env.NODE_ENV !== 'production';
  
  const pusher = new Pusher('8b7a912a1b66ce5ad679', {
    cluster: 'mt1'
  });

  // Canal para el exchange
  const exchangerChannel = pusher.subscribe('exchanger');
  
  return {
    provide: {
      $pusher: pusher,
      $exchangerChannel: exchangerChannel
    }
  };
});