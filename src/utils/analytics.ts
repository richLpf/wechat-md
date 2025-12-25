/**
 * Google Analytics 初始化
 */
export const initGoogleAnalytics = () => {
  const gaId = import.meta.env.VITE_GA_ID
  
  if (!gaId) {
    console.log('Google Analytics ID 未配置，跳过初始化')
    return
  }

  // 加载 Google Analytics 脚本 (gtag.js)
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  document.head.appendChild(script)

  // 初始化 gtag
  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }
  gtag('js', new Date())
  gtag('config', gaId)

  // 将 gtag 挂载到 window 对象，方便全局使用
  ;(window as any).gtag = gtag
}

/**
 * 发送页面浏览事件
 */
export const trackPageView = (path: string) => {
  if (typeof (window as any).gtag === 'function') {
    ;(window as any).gtag('config', import.meta.env.VITE_GA_ID, {
      page_path: path,
    })
  }
}

/**
 * 发送自定义事件
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof (window as any).gtag === 'function') {
    ;(window as any).gtag('event', eventName, eventParams)
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    dataLayer: any[]
    gtag?: (...args: any[]) => void
  }
}

