import {test} from 'node:test';
import assert from 'node:assert/strict';
import {historyEntries,selectReleases,validateEntry} from './release-history.mjs';

function entry(patch){
 const tag=`v1.1.${patch}`;
 return {tag,version:tag.slice(1),url:`https://github.com/firzen/StoneSVN/releases/tag/${tag}`,publishedAt:`2026-10-${String(patch+10).padStart(2,'0')}T12:00:00Z`,notes:Object.fromEntries(['en','zh-CN','zh-TW','ja','ko'].map(lang=>[lang,{title:`Title ${patch}`,items:['Change']}]))};
}
function published(patch){
 const value=entry(patch);
 return {tag_name:value.tag,html_url:value.url,published_at:value.publishedAt,draft:false,prerelease:false};
}
test('selects the five most recently published stable releases, excluding future releases and duplicates',()=>{
 const releases=[published(2),published(6),published(3),published(1),published(4),published(5),published(7),published(6),{...published(8),draft:true},{...published(9),prerelease:true},{...published(3),tag_name:'v1.2.0-rc.1'}];
 assert.deepEqual(selectReleases(releases,entry(6)).map(value=>value.tag_name),['v1.1.6','v1.1.5','v1.1.4','v1.1.3','v1.1.2']);
 assert.throws(()=>selectReleases([published(5)],entry(6)),/Latest/);
});
test('rendering keeps the current manifest authoritative and limits history to five unique entries',()=>{
 const latest=entry(6);
 const stale={...entry(6),notes:entry(1).notes};
 const result=historyEntries(latest,[entry(2),entry(3),entry(4),entry(5),stale,entry(1),entry(5),entry(7)]);
 assert.deepEqual(result.map(value=>value.tag),['v1.1.6','v1.1.5','v1.1.4','v1.1.3','v1.1.2']);
 assert.equal(result[0].notes.en.title,latest.notes.en.title);
 assert.equal(historyEntries(latest,[]).length,1);
});
test('rejects missing translations and invalid release metadata',()=>{
 const missing=entry(6);delete missing.notes.ko;
 assert.throws(()=>validateEntry(missing),/ko/);
 for(const invalid of [{url:'https://example.com'},{publishedAt:'invalid'},{version:'1.0.0'},{tag:'v1.2.0-beta'}])assert.throws(()=>validateEntry({...entry(6),...invalid}));
});
