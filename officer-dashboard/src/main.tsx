import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (import.meta.env.VITE_DEMO_MODE === 'true') {
  const banner = document.createElement('div');
  banner.style.cssText = 'position:sticky;top:0;z-index:9999;background:#fff7d6;color:#352b00;padding:12px 18px;border-bottom:1px solid #e6cc7e;font:14px system-ui;display:flex;gap:16px;flex-wrap:wrap;align-items:center';
  const label=document.createElement('span');label.textContent='Evaluation demo · Synthetic data stored only in this browser · No government submission or live AI';banner.append(label);
  for(const [name,url] of [['Demo guide','/'],['Citizen','/citizen/'],['Officer','/officer/']]) {const a=document.createElement('a');a.textContent=name;a.href=url;a.style.cssText='color:#14534c;font-weight:700';banner.append(a);}
  const reset=document.createElement('button');reset.textContent='Reset demo';reset.onclick=()=>{for(const k of Object.keys(localStorage))if(k.startsWith('civicos_'))localStorage.removeItem(k);location.reload();};reset.style.cssText='border:1px solid #95834f;border-radius:5px;background:white;padding:4px 8px;cursor:pointer';banner.append(reset);
  document.body.prepend(banner);
}
