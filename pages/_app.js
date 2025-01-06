import '../styles/globals.css'
import { useEffect } from 'react'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { app } from '../firebase/config'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // تهيئة Firebase Analytics فقط في جانب العميل (browser)
    const initAnalytics = async () => {
      try {
        if (await isSupported()) {
          getAnalytics(app);
        }
      } catch (error) {
        console.log('Analytics error:', error);
      }
    };

    initAnalytics();
  }, []);

  return <Component {...pageProps} />
}
