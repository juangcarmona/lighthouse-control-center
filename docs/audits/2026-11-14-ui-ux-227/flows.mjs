import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {writeFile} from 'node:fs/promises';
const root='/tmp/lcc-ux-audit-227',origin='https://192.168.0.3:5443';
const browser=await chromium.launch({headless:true});
const ctx=await browser.newContext({ignoreHTTPSErrors:true,storageState:root+'/private-session.json',viewport:{width:1440,height:1000}});
const page=await ctx.newPage();
const result={capturedAt:new Date().toISOString(),sourceWrites:[],steps:[]};
await ctx.route(origin+'/**',route=>{
 if(!['GET','HEAD','OPTIONS'].includes(route.request().method())){result.sourceWrites.push({blocked:route.request().method(),path:new URL(route.request().url()).pathname});return route.abort();}
 return route.continue();
});
await page.addInitScript(()=>{
 window.auditEvents=[];
 const observe=()=>{const n=document.querySelectorAll('.factory-issue').length; if(n&& !window.auditEvents.some(x=>x.kind==='first-issue'))window.auditEvents.push({kind:'first-issue',ms:performance.now(),count:n});};
 new MutationObserver(observe).observe(document,{childList:true,subtree:true});
 window.addEventListener('DOMContentLoaded',()=>window.auditEvents.push({kind:'dom-ready',ms:performance.now()}));
});
const save=async()=>{await writeFile(root+'/evidence/flows.json',JSON.stringify(result,null,2));};
const shot=async name=>{await page.screenshot({path:root+'/evidence/'+name+'.png'});};
try{
 await page.goto(origin+'/workspace/issues');
 await page.waitForFunction(()=>document.querySelector('#factory-refresh')?.disabled===false && document.querySelectorAll('.factory-issue').length>0);
 await page.getByRole('button',{name:'Dark appearance'}).click();
 result.steps.push({flow:'initial-issue-load',events:await page.evaluate(()=>window.auditEvents)});
 await page.locator('#factory-repository').selectOption('juangcarmona/lighthouse-control-center');
 await page.locator('#factory-view').selectOption('board');
 await shot('10-current-board-desktop-dark');
 result.steps.push({flow:'board',columns:await page.locator('.board-column h3').allTextContents(),text:(await page.locator('#factory-results').innerText()).slice(0,3000)});
 await page.setViewportSize({width:390,height:844});await shot('10-current-board-mobile-dark');
 await page.setViewportSize({width:1440,height:1000});
 await page.locator('#factory-view').selectOption('list');
 await page.locator('#factory-search').fill('#48');
 await page.locator('#factory-search').press('Enter');
 await page.waitForFunction(()=>document.querySelector('#factory-refresh')?.disabled===false);
 await page.waitForTimeout(400);
 await shot('11-exact-search-desktop-dark');
 result.steps.push({flow:'exact-number-search',url:page.url(),count:await page.locator('.factory-issue').count(),text:(await page.locator('#factory-results').innerText()).slice(0,1500)});
 const target=page.locator('.factory-issue a').first();
 await target.click();
 await page.waitForFunction(()=>document.querySelector('#issue-body')?.textContent.length>0);
 await page.waitForFunction(()=>!/^Checking|^Refreshing/.test(document.querySelector('#controls-status')?.textContent??''),{},{timeout:45000}).catch(()=>{});
 await page.locator('#issue-description-details').evaluate(el=>el.open=true);
 await shot('12-long-issue-desktop-dark');
 result.steps.push({flow:'long-issue',url:page.url(),text:(await page.locator('body').innerText()).slice(0,18000)});
 const textarea=page.locator('textarea').first();
 if(await textarea.count()){
  await textarea.fill('Borrador local de auditoría: no enviar.');
  result.steps.push({flow:'draft-written',editable:await textarea.isEditable()});
 }
 await page.locator('a[href="/workspace/repositories"]').first().click();
 await page.waitForTimeout(500);
 await page.goBack({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#issue-body')?.textContent.length>0);
 await page.waitForTimeout(1500);
 result.steps.push({flow:'draft-return',draft:await page.locator('textarea').first().inputValue().catch(()=>null),events:await page.evaluate(()=>window.auditEvents)});
 await page.goto(origin+'/workspace/issues?repository=juangcarmona%2Flighthouse-control-center');
 await page.waitForFunction(()=>document.querySelector('#factory-refresh')?.disabled===false&&document.querySelectorAll('.factory-issue').length>0);
 result.steps.push({flow:'warmed-collection',events:await page.evaluate(()=>window.auditEvents)});
 await page.locator('a[href="/workspace"]').first().click();
 // Controlled latency on read endpoints only, for the returning collection.
 await page.route(origin+'/api/connections/github',async route=>{await new Promise(r=>setTimeout(r,1800));await route.continue();});
 await page.route(origin+'/api/factory/**',async route=>{await new Promise(r=>setTimeout(r,2000));await route.continue();});
 const start=Date.now();
 await page.locator('a[href="/workspace/issues"]').first().click();
 await page.waitForTimeout(350);
 result.steps.push({flow:'return-350ms',issues:await page.locator('.factory-issue').count(),text:await page.locator('#factory-status').textContent()});
 await shot('13-return-350ms-desktop-dark');
 await page.waitForFunction(()=>document.querySelectorAll('.factory-issue').length>0,{},{timeout:45000});
 result.steps.push({flow:'return-first-data',wallMs:Date.now()-start,events:await page.evaluate(()=>window.auditEvents),status:await page.locator('#factory-status').textContent()});
 await shot('14-return-restored-desktop-dark');
 await page.waitForFunction(()=>document.querySelector('#factory-refresh')?.disabled===false,{},{timeout:45000});
 await page.unroute(origin+'/api/connections/github');await page.unroute(origin+'/api/factory/**');
 // A controlled read failure tests retention in the existing page, without touching authority.
 await page.route(origin+'/api/factory/**',route=>route.fulfill({status:503,json:{availability:'unavailable'}}));
 await page.locator('#factory-refresh').click();
 await page.waitForFunction(()=>document.querySelector('#factory-refresh')?.disabled===false);
 result.steps.push({flow:'controlled-503-refresh',issues:await page.locator('.factory-issue').count(),text:(await page.locator('body').innerText()).slice(-5000)});
 await shot('15-stale-after-503-desktop-dark');await page.unroute(origin+'/api/factory/**');
 await page.goto(origin+'/workspace/issues');
 await page.waitForFunction(()=>document.querySelector('#factory-refresh')?.disabled===false);
 await page.locator('#factory-search').fill('zz-audit-no-match-227');
 await shot('16-no-match-desktop-dark');
 result.steps.push({flow:'no-match',text:await page.locator('#factory-count').textContent(),resultsText:await page.locator('#factory-results').innerText()});
 await page.locator('#factory-search').fill('');
 await page.setViewportSize({width:320,height:900});
 await page.evaluate(()=>document.documentElement.style.setProperty('font-size','200%','important'));
 result.steps.push({flow:'320px-200-percent',...await page.evaluate(()=>({rootFont:getComputedStyle(document.documentElement).fontSize,overflow:document.documentElement.scrollWidth>innerWidth,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth}))});
 await shot('17-issues-320-text-200-dark');
 const touch=await browser.newContext({ignoreHTTPSErrors:true,storageState:root+'/private-session.json',hasTouch:true,viewport:{width:390,height:844}});
 const tp=await touch.newPage();await tp.goto(origin+'/workspace/issues');await tp.waitForTimeout(4000);
 result.steps.push({flow:'touch-targets',targets:await tp.locator('.theme-option,.header-refresh,.workspace-nav a').evaluateAll(els=>els.map(e=>({label:e.getAttribute('aria-label')||e.textContent.trim(),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})))});
 await touch.close();
 const rp=await ctx.newPage();
 try{await rp.goto('https://lighthouse.jgcarmona.com/',{timeout:20000});await rp.screenshot({path:root+'/evidence/00-lighthouse-reference-desktop.png'});result.reference={url:rp.url(),status:'captured'};}catch(e){result.reference={status:'unavailable',reason:e.message.slice(0,150)}}
 await save();console.log(JSON.stringify(result.steps.map(s=>({...s,text:s.text?.slice(0,200)})),null,2));
}finally{await save();await browser.close();}
