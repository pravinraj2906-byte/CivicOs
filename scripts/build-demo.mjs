import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root=process.cwd();
for(const [app,dest] of [['citizen-app','citizen'],['officer-dashboard','officer']]) {
  if(!process.argv.includes('--assemble-only')) {
    const npm=process.platform==='win32'?'npm.cmd':'npm';
    const r=spawnSync(npm,['run','build'],{cwd:path.join(root,app),env:{...process.env,VITE_DEMO_MODE:'true'},stdio:'inherit',shell:process.platform==='win32'});
    if(r.status!==0)process.exit(r.status||1);
  }
  fs.mkdirSync(path.join(root,'dist',dest),{recursive:true});
  fs.cpSync(path.join(root,app,'dist'),path.join(root,'dist',dest),{recursive:true});
}
fs.cpSync(path.join(root,'citizen-app','public','assets'),path.join(root,'dist','assets'),{recursive:true});
fs.copyFileSync(path.join(root,'demo','index.html'),path.join(root,'dist','index.html'));
fs.writeFileSync(path.join(root,'dist','robots.txt'),'User-agent: *\nDisallow: /citizen/\nDisallow: /officer/\n');
console.log('Static evaluation demo assembled in dist/.');
