
import { onCLS, onFID, onLCP } from 'web-vitals';

export function webVitals({ analyticsId, ...options }) {
  try {
    onCLS((metric) => sendToAnalytics(metric, options));
    onFID((metric) => sendToAnalytics(metric, options));
    onLCP((metric) => sendToAnalytics(metric, options));
  } catch (err) {
    console.error('[Analytics]', err);
  }
}

function sendToAnalytics(metric, options) {
  const body = {
    ...options,
    name: metric.name,
    value: metric.value,
    id: metric.id,
  };

  console.log('[Vitals]', body);
  
}