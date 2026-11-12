
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  baseHref: "/",
  criticalCssPlans: [[1,"/styles-EEBU6YZH.css",2473,["aside","h1","nav","a","header","p","main","button","bg-indigo-600","bg-slate-800","select","article","max-w-lg"],[],[[5,["*","*:before","*:after"],"{box-sizing:border-box}",[0,0,0]],[37,["body","html"],"{margin:0;padding:0;height:100%;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background-color:#020617;color:#f8fafc}",[0,0],["-apple-system","blinkmacsystemfont","segoe ui","roboto","sans-serif"]],[5,["app-main-layout>div",".min-h-screen"],"{min-height:100vh;display:flex}",[[">",[["app-main-layout",0,0,0],["div",0,0,0]]],1]],[5,1,"{width:16rem;background-color:#0f172a;border-right:1px solid #1e293b;display:flex;flex-direction:column;justify-content:space-between;padding:1.5rem 1rem}",[3]],[5,"aside h1","{font-size:1.25rem;font-weight:800;color:#818cf8;margin:0 0 .25rem}",[[" ",[[1,0,0,0],[2,0,0,0]]]]],[5,"aside nav","{display:flex;flex-direction:column;gap:.5rem;margin-top:2rem}",[[" ",[[1,0,0,0],[3,0,0,0]]]]],[5,"aside nav a","{display:flex;align-items:center;gap:.75rem;padding:.65rem 1rem;border-radius:.5rem;color:#94a3b8;text-decoration:none;font-weight:500;font-size:.9rem;transition:all .2s}",[["  ",[[1,0,0,0],[3,0,0,0],[4,0,0,0]]]]],[5,["aside nav a:hover","aside nav a.bg-indigo-600\\/20"],"{background-color:#6366f126;color:#818cf8}",[["  ",[[1,0,0,0],[3,0,0,0],[4,0,0,0]]],["  ",[[1,0,0,0],[3,0,0,0],[4,["bg-indigo-600/20"],0,0]]]]],[5,5,"{display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;border-bottom:1px solid #1e293b;padding-bottom:1rem}",[3]],[5,"header h1","{font-size:1.75rem;color:#818cf8;margin:0}",[[" ",[[5,0,0,0],[2,0,0,0]]]]],[5,"header p","{color:#64748b;font-size:.875rem;margin:.25rem 0 0}",[[" ",[[5,0,0,0],[6,0,0,0]]]]],[5,7,"{flex:1;padding:2rem;overflow-y:auto}",[3]],[5,8,"{cursor:pointer;font:inherit}",[3]],[5,"button.bg-indigo-600","{background-color:#4f46e5;color:#fff;border:none;padding:.6rem 1.2rem;border-radius:.5rem;font-weight:600;transition:background .2s}",[["",[[8,[9],0,0]]]]],[5,"button.bg-indigo-600:hover","{background-color:#4338ca}",[["",[[8,[9],0,0]]]]],[5,"button.bg-slate-800","{background-color:#1e293b;color:#cbd5e1;border:1px solid #334155;padding:.6rem 1rem;border-radius:.5rem;font-weight:500}",[["",[[8,[10],0,0]]]]],[5,"button.bg-slate-800:hover","{background-color:#334155}",[["",[[8,[10],0,0]]]]],[5,11,"{background-color:#0f172a;color:#cbd5e1;border:1px solid #334155;padding:.5rem 1rem;border-radius:.5rem;font:inherit}",[3]],[5,".grid","{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.5rem}",[1]],[5,12,"{background-color:#0f172a;border:1px solid #1e293b;border-radius:.75rem;padding:1.5rem;box-shadow:0 4px 6px -1px #0003}",[3]],[5,"article h3","{margin:0 0 .5rem;color:#f1f5f9;font-size:1.15rem}",[[" ",[[12,0,0,0],["h3",0,0,0]]]]],[5,"article p","{color:#94a3b8;font-size:.875rem;line-height:1.4;margin-bottom:1rem}",[[" ",[[12,0,0,0],[6,0,0,0]]]]],[5,".fixed","{position:fixed;inset:0;background-color:#000000bf;display:flex;align-items:center;justify-content:center;z-index:1000}",[1]],[5,".max-w-lg","{background-color:#0f172a;border:1px solid #1e293b;border-radius:1rem;padding:2rem;width:100%;max-width:32rem}",[1]],[5,[".max-w-lg input",".max-w-lg textarea"],"{width:100%;padding:.65rem .85rem;background-color:#1e293b;border:1px solid #334155;border-radius:.5rem;color:#f8fafc;font:inherit;margin-top:.35rem;margin-bottom:1rem}",[[" ",[13,["input",0,0,0]]],[" ",[13,["textarea",0,0,0]]]]]]]],
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/projects",
    "relativeRedirect": true,
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "route": "/signup"
  },
  {
    "renderMode": 2,
    "route": "/forgot-password"
  },
  {
    "renderMode": 2,
    "route": "/reset-password"
  },
  {
    "renderMode": 2,
    "route": "/projects"
  },
  {
    "renderMode": 2,
    "route": "/analytics"
  },
  {
    "renderMode": 2,
    "redirectTo": "/",
    "relativeRedirect": true,
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    "index.csr.html": {size: 991, hash: "cc2e0a0e4ea95c69", text: () => import("./assets-chunks/index_csr_html.mjs").then(m => m.default)},
    "index.server.html": {size: 1005, hash: "1ad06024f91038b5", text: () => import("./assets-chunks/index_server_html.mjs").then(m => m.default)},
    "login/index.html": {size: 10405, hash: "7a0bb05324659392", text: () => import("./assets-chunks/login_index_html.mjs").then(m => m.default)},
    "reset-password/index.html": {size: 8925, hash: "f206c3da70539ee9", text: () => import("./assets-chunks/reset-password_index_html.mjs").then(m => m.default)},
    "signup/index.html": {size: 9292, hash: "f0a1194d0794459b", text: () => import("./assets-chunks/signup_index_html.mjs").then(m => m.default)},
    "forgot-password/index.html": {size: 8784, hash: "8b0e6543a3e3df59", text: () => import("./assets-chunks/forgot-password_index_html.mjs").then(m => m.default)},
    "analytics/index.html": {size: 240, hash: "a0cf888abc037039", text: () => import("./assets-chunks/analytics_index_html.mjs").then(m => m.default)},
    "projects/index.html": {size: 240, hash: "a0cf888abc037039", text: () => import("./assets-chunks/projects_index_html.mjs").then(m => m.default)}
  },
};
