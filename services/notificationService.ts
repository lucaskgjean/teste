
import { CustomNotification } from '../types';

class NotificationService {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações desktop');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  sendNotification(title: string, options?: NotificationOptions) {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      // Tenta usar o ServiceWorker se disponível (melhor para Android)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            ...options,
          });
        });
      } else {
        try {
          new Notification(title, options);
        } catch (e) {
          console.error('Erro ao enviar notificação:', e);
        }
      }
    }
  }

  checkAndTriggerCustomNotifications(customNotifications: CustomNotification[]) {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);

    customNotifications.forEach(notif => {
      if (notif.enabled && notif.time === currentTime && notif.days.includes(currentDay)) {
        // Evita disparar múltiplas vezes no mesmo minuto
        const lastTriggered = localStorage.getItem(`notif_last_${notif.id}`);
        const todayStr = now.toISOString().split('T')[0];
        const triggerKey = `${todayStr}_${currentTime}`;

        if (lastTriggered !== triggerKey) {
          this.sendNotification(notif.title, { body: notif.message });
          localStorage.setItem(`notif_last_${notif.id}`, triggerKey);
        }
      }
    });
  }
}

export const notificationService = new NotificationService();
