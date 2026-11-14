import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root='/tmp/lcc-ux-audit-227/evidence',report={checks:[],screenshots:[],axe:[]};
const allowed=new Set(['proposal.html','tokens.css','lighthouse.svg']);
const server=createServer(async(req,res)=>{const file=new URL(req.url,'http://localhost').pathname.slice(1);if(!allowed.has(file)){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':'image/svg+xml');res.end(await readFile(root+'/'+file));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();
try{
 for(const view of ['board','detail']){
  await page.goto(origin+'/proposal.html?view='+view);
  for(const [width,height,mode] of [[1440,1000,'desktop'],[390,844,'mobile']])for(const theme of ['dark','light']){
   await page.setViewportSize({width,height});await page.getByRole('button',{name:theme+' appearance',exact:false}).click();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);
   const file=`proposal-${view}-${mode}-${theme}.png`;await page.screenshot({path:root+'/'+file});report.screenshots.push({file,width,height,overflow});
   if(width===1440){const a=await new AxeBuilder({page}).analyze();report.axe.push({view,theme,violations:a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});}
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(origin+'/proposal.html');
 assert.equal(await page.locator('.card').count(),7);
 await page.getByRole('button',{name:'Control Center',exact:true}).click();assert.equal(await page.locator('.card').count(),3);
 await page.locator('#search').fill('no-matching-demo-227');assert.equal(await page.locator('.card').count(),0);
 await page.locator('#search').fill('');await page.getByRole('button',{name:'List',exact:true}).click();assert.equal(await page.locator('.board.list').count(),1);
 await page.locator('.card').first().click();await page.locator('#draft').fill('Example draft: preview only.');
 await page.getByRole('button',{name:'Review comment',exact:true}).click();assert.equal(await page.locator('#preview').textContent(),'Example draft: preview only.');
 assert.equal(await page.locator('#cancel').evaluate(e=>e===document.activeElement),true);
 await page.locator('#cancel').click();await page.getByRole('link',{name:'← Work · Control Center'}).click();await page.locator('.card').first().click();assert.equal(await page.locator('#draft').inputValue(),'Example draft: preview only.');
 report.checks.push('Project filter, title search, no match, list mode, issue navigation, local draft restore, preview and focus verified.');
 await page.goto(origin+'/proposal.html');await page.setViewportSize({width:320,height:900});await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).fontSize),'32px');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 report.checks.push('320px width at 200% root text (32px) has no page overflow.');
 await writeFile(root+'/proposal-checks.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
