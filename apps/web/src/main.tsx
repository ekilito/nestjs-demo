import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'
import './index.css'
import App from './App.tsx'
import 'antd/dist/reset.css'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 8,
          },
          components: {
            Menu: {
              itemHeight: 40,
              itemBorderRadius: 6,
              itemMarginInline: 8,
              itemSelectedBg: 'rgba(22, 119, 255, 0.12)',
              itemSelectedColor: '#1677ff',
              itemHoverBg: 'rgba(22, 119, 255, 0.06)',
              itemActiveBg: 'rgba(22, 119, 255, 0.10)',
            },
            Layout: {
              headerBg: '#fff',
              siderBg: '#fff',
            },
          },
        }}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>,
)
