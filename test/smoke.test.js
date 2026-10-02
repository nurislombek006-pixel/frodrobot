import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

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
