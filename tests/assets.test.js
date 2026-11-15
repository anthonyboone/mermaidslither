import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

test('every offline shell file exists and runtime stays self-contained',async()=>{
  const source=await readFile(new URL('../sw.js',import.meta.url),'utf8');
  const files=source.match(/const FILES=\[([^\]]+)\]/)[1].match(/'([^']+)'/g).map(s=>s.slice(1,-1));
  for(const file of files){const path=file==='./'?'index.html':file;assert.ok((await stat(new URL(`../${path}`,import.meta.url))).isFile(),path);}
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.equal(/(?:src|href)="https?:\/\//.test(html),false);
});
test('PNG install icons have the advertised dimensions',async()=>{
  for(const [name,size] of [['apple-touch-icon.png',180],['icon-192.png',192],['icon-512.png',512]]){
    const bytes=await readFile(new URL(`../assets/${name}`,import.meta.url));
    assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(bytes.readUInt32BE(16),size);assert.equal(bytes.readUInt32BE(20),size);
  }
});
