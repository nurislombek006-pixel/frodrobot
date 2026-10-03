import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import { inboxPage } from '../lib/inbox-page.js';

const source=await readFile(new URL('../server.js',import.meta.url),'utf8');

test('chat write routes are registered',()=>{
  for(const route of ['/api/chat/send','/api/chat/edit','/api/chat/delete','/api/chat/media','/api/chat/dialog']){
    assert.match(source,new RegExp(route.replaceAll('/','\\/')));
  }
});

test('stable identity and duplicate merge are present',()=>{
  assert.match(source,/mergeDuplicateDialogs/);
  assert.match(source,/identity_owner/);
  assert.match(source,/ownerId\+'\:'\+chatId/);
});

test('backup and audit features are present',()=>{
  assert.match(source,/runAutoBackup/);
  assert.match(source,/audit_events/);
  assert.match(source,/version:3/);
});

test('account summaries include chat totals and enabled state',()=>{
  assert.match(source,/dialog_count/);
  assert.match(source,/connected\?['"]on['"]:['"]off['"]/);
  assert.match(source,/is_enabled/);
});

test('mobile chat home no longer exposes archive or journal',()=>{
  const page=source.slice(source.indexOf('function homePageV3'),source.indexOf('function auditPage'));
  assert.doesNotMatch(page,/Журнал действий|data-f="archive"|data-action="archive"|\['archived'/);
  assert.match(page,/бот отключён/i);
  assert.match(page,/чатов/);
  assert.match(page,/data-view="chats"/);
  assert.match(page,/data-view="accounts"/);
  assert.match(page,/data-view="settings"/);
  assert.match(page,/Telegram\.WebApp/);
});

test('chat history is paged to keep chat opening and polling lightweight',()=>{
  assert.match(source,/const pageSize=Math\.max\(50,Math\.min\(Number\.parseInt\(req\.query\.limit\|\|'250',10\)\|\|250,500\)\)/);
  assert.match(source,/d\.has_more=mr\.rows\.length>pageSize/);
  assert.match(source,/const PAGE_SIZE=250/);
  assert.match(source,/async function loadOlder\(\)/);
});

test('chat transitions respect reduced motion settings',()=>{
  assert.match(source,/@view-transition\{navigation:auto\}/);
  assert.match(source,/prefers-reduced-motion:reduce/);
  assert.match(source,/::view-transition-new\(root\)/);
});

test('chat page inline JavaScript parses after server template values are filled',()=>{
  const start=source.indexOf('\nconst DIALOG_ID=',source.indexOf('function chatPageV2'));
  const end=source.indexOf('\n</script>',start);
  assert.ok(start>0&&end>start,'chat page script boundaries exist');
  const script=source.slice(start+1,end).replace(/\$\{JSON\.stringify\([^}]+\)\}/g,'"test"');
  assert.doesNotThrow(()=>new Script(script));
  const zoomStart=source.indexOf('</script><script>\nfunction setChatScale(',end);
  const zoomEnd=source.indexOf('\n</script>',zoomStart);
  assert.ok(zoomStart>0&&zoomEnd>zoomStart,'chat zoom script boundaries exist');
  assert.doesNotThrow(()=>new Script(source.slice(zoomStart+'</script><script>'.length,zoomEnd)));
  assert.match(source,/setChatScale\(scale-\.1\)/);
  assert.match(source,/setChatScale\(scale\+\.1\)/);
  assert.doesNotMatch(source,/document\.addEventListener\('touchend'/);
});

test('responsive real inbox page uses the chat API and hides IDs in the list',()=>{
  const page=inboxPage({query:{key:'test-key'}});
  const script=page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);
  assert.doesNotThrow(()=>new Script(script));
  assert.match(page,/grid-template-columns:minmax\(320px,390px\)/);
  assert.match(page,/@media\(max-width:760px\)/);
  assert.match(page,/\/api\/chat\?key=/);
  assert.match(page,/\/c\?/);
  assert.match(page,/Telegram ID/);
  assert.match(script,/p\.short\|\|p\.name/);
  assert.match(script,/Math\.max\(\.5,Math\.min\(1\.5/);
  assert.match(script,/От 50% до 150%/);
  assert.match(script,/frod-font-scale/);
  assert.doesNotMatch(script,/touchend|DoubleTap/);
  assert.match(page,/maximum-scale=1,user-scalable=no/);
  assert.match(page,/touch-action:pan-x pan-y/);
  assert.doesNotMatch(page,/const NM=|demo data|setInterval\(\(\)=>\{if\(!bot\)/i);
});

test('pinch zoom is disabled on inbox and chat while text buttons remain',()=>{
  assert.match(source,/maximum-scale=1,user-scalable=no/);
  assert.match(source,/touch-action:pan-x pan-y/);
  assert.match(source,/id="fontDown"/);
  assert.match(source,/id="fontUp"/);
  assert.doesNotMatch(source,/document\.addEventListener\('touchend'/);
});
