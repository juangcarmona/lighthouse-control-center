import {chromium} from 'playwright';import {writeFile} from 'node:fs/promises';
const root='/tmp/lcc-ux-audit-227/evidence',origin='https://192.168.0.3:5443';
const b=await chromium.launch();const c=await b.newContext({ignoreHTTPSErrors:true,storageState:'/tmp/lcc-ux-audit-227/private-session.json',viewport:{width:1440,height:1000}});const p=await c.newPage(),steps=[];
await c.route(origin+'/**',r=>['GET','HEAD','OPTIONS'].includes(r.request().method())?r.continue():r.abort());
const shot=async name=>p.screenshot({path:root+'/'+name+'.png'});
try{
 await p.goto(origin+'/workspace/repositories/juangcarmona/lighthouse-control-center');await p.waitForFunction(()=>document.querySelector('#factory-refresh')?.disabled===false&&document.querySelector('.factory-issue'));
 await p.getByRole('button',{name:'Dark appearance'}).click();
 await p.locator('#factory-project-details').evaluate(e=>e.open=true);
 await p.locator('#factory-projects details').first().evaluate(e=>e.open=true);
 const before=await p.locator('.factory-issue').count();const more=p.getByRole('button',{name:'Load next issue page',exact:true});
 if(await more.count()){await more.first().click();await p.waitForFunction(()=>document.querySelector('#factory-refresh')?.disabled===false);steps.push({flow:'load-next-issue-page',before,after:await p.locator('.factory-issue').count(),count:await p.locator('#factory-count').textContent()});}
 await p.locator('.factory-issue').first().locator('details').first().evaluate(e=>e.open=true);
 await p.getByRole('button',{name:'Read issue evidence',exact:true}).first().click();
 await p.waitForFunction(()=>/Historical|unavailable/i.test(document.querySelector('#factory-status')?.textContent??''),{},{timeout:45000});
 steps.push({flow:'read-issue-evidence',status:await p.locator('#factory-status').textContent(),card:(await p.locator('.factory-issue').first().innerText()).slice(0,6000)});await shot('18-evidence-read-desktop-dark');
 await p.goto(origin+'/workspace/health/juangcarmona/lighthouse');await p.waitForTimeout(6500);await shot('19-health-project-desktop-dark');
 steps.push({flow:'health-project',url:p.url(),text:(await p.locator('main').innerText()).slice(0,8000)});
 const run=p.locator('main a[href*="/runs/"]').first();
 if(await run.count()){await run.click();await p.waitForTimeout(6000);await shot('20-health-run-desktop-dark');steps.push({flow:'health-run',url:p.url(),text:(await p.locator('main').innerText()).slice(0,7000)});}
 await p.setViewportSize({width:390,height:844});await shot('20-health-run-mobile-dark');
 await p.goto(origin+'/workspace/issues');await p.waitForTimeout(6000);await p.keyboard.press('Tab');
 steps.push({flow:'keyboard-first-tab',focused:await p.evaluate(()=>({tag:document.activeElement.tagName,text:document.activeElement.textContent,outline:getComputedStyle(document.activeElement).outlineStyle}))});
 console.log(JSON.stringify(steps.map(x=>({...x,text:x.text?.slice(0,150),card:x.card?.slice(0,150)}))));
}finally{await writeFile(root+'/secondary-flows.json',JSON.stringify({capturedAt:new Date().toISOString(),sourceWritePerformed:false,steps},null,2));await b.close();}
