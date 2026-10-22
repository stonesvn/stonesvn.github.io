import {execFileSync} from 'node:child_process';
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const repository='firzen/StoneSVN';
const languages=['en','zh-CN','zh-TW','ja','ko'];
const stableTag=/^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;
const legacyRef='f5c5b2c70fee0d4f3a3ca376bec9c8628bb93e6c';

export function validateEntry(entry){
 if(!stableTag.test(entry.tag)||entry.version!==entry.tag.slice(1)||entry.url!==`https://github.com/${repository}/releases/tag/${entry.tag}`||!Number.isFinite(Date.parse(entry.publishedAt)))throw new Error('Invalid release history entry');
 for(const lang of languages){
  const notes=entry.notes?.[lang];
  if(typeof notes?.title!=='string'||!notes.title.trim()||!Array.isArray(notes.items)||!notes.items.length||notes.items.some(item=>typeof item!=='string'||!item.trim()))throw new Error(`Missing release notes: ${entry.tag} ${lang}`);
 }
 return entry;
}

export function selectReleases(releases,latest){
 const selected=releases.filter(entry=>!entry.draft&&!entry.prerelease&&stableTag.test(entry.tag_name)&&Number.isFinite(Date.parse(entry.published_at))&&Date.parse(entry.published_at)<=Date.parse(latest.publishedAt))
  .sort((a,b)=>Date.parse(b.published_at)-Date.parse(a.published_at)||b.tag_name.localeCompare(a.tag_name,'en',{numeric:true}));
 const unique=selected.filter((entry,index)=>selected.findIndex(other=>other.tag_name===entry.tag_name)===index).slice(0,5);
 if(unique[0]?.tag_name!==latest.tag)throw new Error('Release history must start with the synchronized Latest release');
 return unique;
}

export function historyEntries(latest,history){
 validateEntry(latest);
 const entries=[latest,...history.filter(entry=>entry.tag!==latest.tag)].map(validateEntry);
 return entries.filter(entry=>Date.parse(entry.publishedAt)<=Date.parse(latest.publishedAt))
  .sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)||b.tag.localeCompare(a.tag,'en',{numeric:true}))
  .filter((entry,index,list)=>list.findIndex(other=>other.tag===entry.tag)===index).slice(0,5);
}

const api=endpoint=>JSON.parse(execFileSync('gh',['api',endpoint],{encoding:'utf8',maxBuffer:10*1024*1024}));
async function sync(){
 const latest=JSON.parse(await readFile(new URL('./release.json',import.meta.url),'utf8'));
 validateEntry(latest);
 const releases=JSON.parse(execFileSync('gh',['api','--paginate','--slurp',`repos/${repository}/releases?per_page=100`],{encoding:'utf8',maxBuffer:20*1024*1024})).flat();
 const entries=[];
 for(const release of selectReleases(releases,latest)){
  const tag=release.tag_name;
  if(tag===latest.tag){
   const {sourceSha,...entry}=latest;
   entries.push(entry);
   continue;
  }
  // v1.1.2 predates published summaries; use the existing immutable backfill.
  const ref=tag==='v1.1.2'?legacyRef:tag;
  const content=api(`repos/${repository}/contents/docs/releases/${tag}.website.json?ref=${ref}`);
  const notes=JSON.parse(Buffer.from(content.content,'base64').toString('utf8'));
  entries.push(validateEntry({tag,version:tag.slice(1),url:release.html_url,publishedAt:release.published_at,notes}));
 }
 await writeFile(new URL('./release-history.json',import.meta.url),JSON.stringify(entries,null,2)+'\n');
 console.log(`Synchronized release history: ${entries.map(entry=>entry.tag).join(', ')}`);
}
if(process.argv[1]===fileURLToPath(import.meta.url))await sync();
