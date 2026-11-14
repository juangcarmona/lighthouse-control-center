import {chromium} from 'playwright';import {writeFile} from 'node:fs/promises';
const root='/tmp/lcc-ux-audit-227/evidence/references',b=await chromium.launch(),c=await b.newContext({viewport:{width:1440,height:1000}}),p=await c.newPage(),out=[];
async function snap(name){await p.screenshot({path:root+'/'+name+'.png'});out.push({name,url:p.url(),title:await p.title(),bodyTextRetained:false,controls:await p.locator('button').evaluateAll(xs=>xs.map(x=>({text:x.textContent,aria:x.getAttribute('aria-label')}))),links:await p.locator('a').evaluateAll(xs=>xs.map(x=>({text:x.textContent.trim().slice(0,80),href:x.href})).filter(x=>x.text))});}
await p.goto('https://platform.plainconcepts.dev/',{waitUntil:'networkidle'});await snap('platform-home-desktop');await p.setViewportSize({width:390,height:844});await snap('platform-home-mobile');await p.setViewportSize({width:1440,height:1000});
await p.goto('https://platform.plainconcepts.dev/docs/how-we-work',{waitUntil:'networkidle'});await snap('platform-process-desktop');
await p.goto('https://health.platform.plainconcepts.dev/',{waitUntil:'networkidle'});await snap('health-overview-desktop');await p.getByRole('button',{name:'Show only these',exact:true}).click();await snap('health-attention-filter');
await p.goto('https://health.platform.plainconcepts.dev/projects/checkout/',{waitUntil:'networkidle'});await snap('health-project-engineering');
for(const name of ['Delivery','Agentic','Roadmap']){const btn=p.getByRole('button',{name,exact:true});if(await btn.count()){await btn.click();await p.waitForTimeout(300);await snap('health-project-'+name.toLowerCase());}}
await p.setViewportSize({width:390,height:844});await snap('health-project-mobile');
await writeFile(root+'/flows.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out.map(x=>({...x,links:x.links.slice(0,12)})),null,2));await b.close();
