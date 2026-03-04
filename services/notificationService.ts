
import { CustomNotification } from '../types';

class NotificationService {
  async requestPermission(): Promise<boolean> {
    const isMedian = (window as any).gonative || (window as any).median || navigator.userAgent.includes('gonative');
    
    // 1. Tenta a ponte nativa do Median (GoNative) se estiver no APK
    if (isMedian) {
      try {
        window.location.href = 'gonative://notifications/register';
        // No Median, muitas vezes não conseguimos esperar o retorno síncrono da permissão web
        // Retornamos true para permitir que o usuário ative a interface no app
        return true; 
      } catch (e) {
        console.error('Erro ao chamar ponte Median:', e);
      }
    }

    // 2. Tenta o método padrão da Web
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações desktop');
      // Se for mobile mas não suportar a API Notification, permitimos ativar a lógica interna
      return isMedian; 
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      // Alguns navegadores mobile antigos lançam erro no requestPermission
      return isMedian;
    }
  }

  sendNotification(title: string, options?: NotificationOptions) {
    if (!('Notification' in window)) return;
    
    const icon = 'https://cdn-icons-png.flaticon.com/512/1165/1165961.png';
    
    if (Notification.permission === 'granted') {
      // Tenta usar o ServiceWorker se disponível (melhor para Android/Median)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            icon: icon,
            badge: icon,
            vibrate: [100, 50, 100],
            ...options,
          } as any);
        }).catch(() => {
          // Fallback se o SW falhar
          new Notification(title, { icon, ...options });
        });
      } else {
        try {
          new Notification(title, { icon, ...options });
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
