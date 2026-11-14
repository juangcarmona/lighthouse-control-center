import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {writeFile,rename} from 'node:fs/promises';
const root='/tmp/lcc-ux-audit-227', origin='https://192.168.0.3:5443';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({ignoreHTTPSErrors:true,storageState:root+'/private-session.json',viewport:{width:1440,height:1000}});
const page=await context.newPage();
const results=[], requests=[], errors=[];
await context.route('**/*',async route=>{
 const r=route.request();
 if(new URL(r.url()).origin===origin && !['GET','HEAD','OPTIONS'].includes(r.method())) {errors.push({blockedWrite:new URL(r.url()).pathname,method:r.method()});return route.abort();}
 return route.continue();
});
page.on('response',r=>{if(r.url().startsWith(origin+'/api/'))requests.push({path:new URL(r.url()).pathname,status:r.status(),time:Date.now()});});
page.on('pageerror',e=>errors.push({page:page.url(),message:e.message}));
const routes=[
 ['01-account','/workspace','#account'],
 ['02-overview','/workspace/operations','#repositories'],
 ['03-repositories','/workspace/repositories','#factory-results'],
 ['04-issues','/workspace/issues','#factory-results'],
 ['05-project','/workspace/repositories/juangcarmona/lighthouse-control-center','#factory-results'],
 ['06-issue','/workspace/issues/juangcarmona/lighthouse-control-center/227','#issue-body'],
 ['07-inbox','/workspace/attention','#factory-results'],
 ['08-runtime','/workspace/runtime','#host-registrations'],
 ['09-health','/workspace/health','main']
];
try{
 for(const [name,path,selector] of routes){
  await page.setViewportSize({width:1440,height:1000});
  const started=Date.now();
  const response=await page.goto(origin+path,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1000);
  let settled=true;
  await page.waitForFunction(()=> {
   const pending=/^(Loading|Reading source context|Checking|Connecting|Refreshing shared|Verifying current)/i;
   const elements=[...document.querySelectorAll('[role=status], #account-status, #controls-status')];
   return !elements.some(x=>!x.hidden&&pending.test(x.textContent.trim()))
    && ![...document.querySelectorAll('#factory-refresh, #host-refresh, #runners-refresh')].some(x=>x.disabled);
  },{},{timeout:45000}).catch(()=>{settled=false;});
  await page.waitForTimeout(1000);
  const info={name,path,status:response.status(),url:page.url(),settledMs:Date.now()-started,text:(await page.locator('body').innerText()).slice(0,22000),modes:[]};
  for(const [width,height,mode] of [[1440,1000,'desktop'],[390,844,'mobile']]){
   await page.setViewportSize({width,height});
   for(const theme of ['dark','light']){
    const button=page.getByRole('button',{name:new RegExp('^'+theme+' appearance$','i')});
    if(await button.count())await button.click();
    await page.waitForTimeout(120);
    const file=`${name}-${mode}-${theme}.png`;
    await page.screenshot({path:root+'/evidence/'+file,fullPage:false});
    info.modes.push({file,...await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,theme:document.documentElement.dataset.lhTheme,rootFont:getComputedStyle(document.documentElement).fontSize,bodyFont:getComputedStyle(document.body).fontSize,rail:document.querySelector('.site-sidebar')?.getBoundingClientRect().width,firstRowY:document.querySelector('.factory-issue, .repository, .factory-project')?.getBoundingClientRect().y}))});
   }
  }
  await page.setViewportSize({width:1440,height:1000});
  const axe=await new AxeBuilder({page}).analyze();
  info.axe=axe.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));
  info.settled=settled;
  results.push(info);
  await writeFile(root+'/evidence/observations.json',JSON.stringify({capturedAt:new Date().toISOString(),origin,certificate:'Private development certificate; browser ignoreHTTPSErrors enabled for this isolated audit only.',results,requests,errors},null,2));
  console.log(JSON.stringify({name,status:info.status,settledMs:info.settledMs,text:info.text.slice(0,350),axe:info.axe.map(x=>x.id),overflow:info.modes.filter(x=>x.overflow).map(x=>x.file)}));
 }
}finally{await browser.close();}
