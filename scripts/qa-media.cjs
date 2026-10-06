const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE_PATH || 'playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({headless: true});
 const page = await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[]; page.on('pageerror',err=>errors.push(err.message));
 await page.goto('http://localhost:3000/');
 await page.getByRole('button',{name:'Home',exact:true}).first().waitFor();
 assert.equal(await page.getByRole('button',{name:'Open picture and audio uploads'}).count(),0);
 assert.equal(await page.getByRole('button',{name:'Gallery',exact:true}).count(),0);
 await page.getByRole('button',{name:'Expand audio settings'}).click();
 assert.equal(await page.getByRole('button',{name:'Upload tracks'}).count(),0);
 // Component fixture uses mocked network services; this does not verify live Firebase.
 await page.route('**/src/lib/media.ts*',route=>route.fulfill({contentType:'text/javascript',body:`
 export const IMAGE_TYPES=['image/jpeg','image/png','image/webp','image/gif'];
 export const AUDIO_TYPES=['audio/mpeg','audio/wav'];
 export function validateMedia(file,kind){if(!(kind==='picture'?IMAGE_TYPES:AUDIO_TYPES).includes(file.type)) throw Error('Please choose a supported file.');}
 export function mediaError(e){return e.message;}
 export async function uploadMedia(file,kind,title,progress){progress(25); await new Promise(r=>setTimeout(r,100)); progress(100);}
 export async function loadMediaBlob(item){if(item.kind==='picture')return (await fetch('/images/john-alan-whittle.jpg')).blob(); const bytes=new Uint8Array(8044);const v=new DataView(bytes.buffer);function s(o,t){for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i));}s(0,'RIFF');v.setUint32(4,8036,true);s(8,'WAVE');s(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,8000,true);v.setUint32(28,16000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);s(36,'data');v.setUint32(40,8000,true);return new Blob([bytes],{type:'audio/wav'});}
 `}));
 await page.goto('http://localhost:3000/scripts/fixtures/media.html?manager=false');
 await page.getByRole('heading',{name:'Picture Gallery'}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Open picture and audio uploads'}).count(),0);
 assert.equal(await page.getByRole('button',{name:'Add a picture'}).count(),0);
 await page.getByRole('button',{name:'Expand audio settings'}).click();
 assert.equal(await page.getByRole('button',{name:'Upload tracks'}).count(),0);
 await page.goto('http://localhost:3000/scripts/fixtures/media.html');
 await page.getByRole('heading',{name:'Picture Gallery'}).waitFor();
 await page.getByRole('img',{name:'A treasured memory'}).waitFor();
 await page.getByRole('button',{name:'Open picture and audio uploads'}).click();
 await page.getByRole('dialog').waitFor();
 assert.equal(await page.getByRole('button',{name:'Upload',exact:true}).isDisabled(),true);
 await page.locator('#media-file').setInputFiles({name:'invalid.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')});
 await page.getByRole('alert').waitFor();
 await page.locator('#media-file').setInputFiles('public/images/john-alan-whittle.jpg');
 await page.locator('#media-title').fill('A family memory');
 await page.getByRole('button',{name:'Upload',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Picture uploaded to the gallery.'}).waitFor();
 await page.locator('#media-kind').selectOption('audio');
 await page.locator('#media-file').setInputFiles({name:'test.mp3',mimeType:'audio/mpeg',buffer:Buffer.from('test')});
 await page.getByRole('button',{name:'Upload',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Audio track uploaded to the background music playlist.'}).waitFor();
 await page.getByRole('button',{name:'Close media settings'}).click();
 await page.getByRole('button',{name:'Expand audio settings'}).click();
 await page.waitForFunction(() => document.querySelector('#shared-audio-track')?.value === 'audio');
 assert.equal(await page.locator('#shared-audio-track').inputValue(), 'audio');
 await page.getByText('Remembering John',{exact:true}).first().waitFor();
 await page.getByRole('button',{name:'Play music',exact:true}).click();
 await page.getByRole('button',{name:'Pause music',exact:true}).waitFor();
 await page.getByRole('button',{name:'Pause music',exact:true}).click();
 await page.getByRole('button',{name:'Zen Temple Chimes'}).click();
 await page.getByRole('button',{name:'Open picture and audio uploads'}).click();
 await page.screenshot({path:'scripts/artifacts/media-upload-desktop.png'});
 await page.keyboard.press('Escape');
 assert.equal(await page.getByRole('dialog').count(),0);
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Open picture and audio uploads'}).click();
 await page.getByRole('dialog').waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
 await page.screenshot({path:'scripts/artifacts/media-upload-mobile.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: signed-out restrictions, gallery picture, cog popup, invalid file rejection, picture/audio upload UI, playback/pause/chimes, Escape, mobile layout. Firebase services mocked for component checks.');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
