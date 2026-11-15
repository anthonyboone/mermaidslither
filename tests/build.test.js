import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { build } from '../tools/build.mjs';

async function temporary(){
  const base=process.platform==='win32'?path.join(process.env.LOCALAPPDATA,'Temp','opencode'):tmpdir();
  await mkdir(base,{recursive:true});return mkdtemp(path.join(base,'mermaid-build-test-'));
}
test('production package includes only runtime and gets a deterministic cache revision',async()=>{
  const temp=await temporary();
  try{
    const destination=path.join(temp,'site');const first=await build(destination),second=await build(destination);
    assert.equal(first.revision,second.revision);
    assert.deepEqual((await readdir(destination)).sort(),['.mermaid-build','.nojekyll','assets','index.html','js','manifest.webmanifest','style.css','sw.js'].sort());
    const sw=await readFile(path.join(destination,'sw.js'),'utf8');assert.ok(sw.includes(`const CACHE='mermaid-slither-${first.revision}';`));
    assert.ok(!(await readFile(path.join(destination,'index.html'),'utf8')).includes('src="/js/'));
  }finally{await rm(temp,{recursive:true,force:true});}
});
test('build refuses to replace an unknown folder',async()=>{
  const temp=await temporary();
  try{
    await writeFile(path.join(temp,'important.txt'),'keep me');
    await assert.rejects(build(temp),/Refusing to overwrite an unmarked directory/);
    assert.equal(await readFile(path.join(temp,'important.txt'),'utf8'),'keep me');
  }finally{await rm(temp,{recursive:true,force:true});}
});
