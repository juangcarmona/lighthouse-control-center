import { chromium } from 'playwright';
import {writeFile,mkdir} from 'node:fs/promises';
const root='/tmp/lcc-ux-audit-227/evidence/references';await mkdir(root,{recursive:true});
const browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:1000}});const results=[];
for(const [name,url] of [['platform','https://platform.plainconcepts.com/'],['health','https://health.plainconcepts.com/'],['health-demo','https://plainconceptsplatform.github.io/project-health/']]){const page=await context.newPage();try{const response=await page.goto(url,{waitUntil:'networkidle',timeout:40000});await page.screenshot({path:root+'/'+name+'-desktop.png'});results.push({name,url:page.url(),status:response.status(),title:await page.title(),bodyTextRetained:false,links:await page.locator('a').evaluateAll(as=>as.map(a=>({text:a.textContent.trim().slice(0,80),href:a.href}))),buttons:await page.locator('button').allTextContents()});}catch(e){results.push({name,url,error:e.message})}await page.close();}
await writeFile(root+'/scan.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();
