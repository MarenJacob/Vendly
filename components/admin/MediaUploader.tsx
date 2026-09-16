'use client';
import {useState} from 'react';
import {Check, LoaderCircle, UploadCloud} from 'lucide-react';

export default function MediaUploader({kind,onUploaded}:{kind:'image'|'video';onUploaded:(url:string)=>void}){
  const [status,setStatus]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [lastResponse,setLastResponse]=useState('');

  async function upload(file:File){
    setError(''); setStatus(''); setLastResponse(''); setBusy(true);
    try{
      if(kind==='image'&&!file.type.startsWith('image/')) throw new Error(`That file looks like "${file.type||'unknown type'}", not an image.`);
      if(kind==='video'&&!file.type.startsWith('video/')) throw new Error(`That file looks like "${file.type||'unknown type'}", not a video.`);
      const maxSize=kind==='image'?8*1024*1024:80*1024*1024;
      if(file.size>maxSize) throw new Error(`This file is ${(file.size/1024/1024).toFixed(1)}MB — the limit is ${maxSize/1024/1024}MB.`);

      setStatus('Requesting upload permission…');
      const sig=await fetch('/api/admin/media/sign',{method:'POST'});
      const sigText=await sig.text();
      let data:any;
      try{ data=JSON.parse(sigText); } catch { throw new Error(`Signing step returned something unexpected: ${sigText.slice(0,200)}`); }
      if(!sig.ok) throw new Error(data.error||`Signing step failed (HTTP ${sig.status}).`);
      if(!data.cloudName||!data.apiKey||!data.signature) throw new Error('Signing step succeeded but returned incomplete data — check Cloudinary env vars are all set.');

      setStatus(`Uploading to Cloudinary (cloud: ${data.cloudName})…`);
      const body=new FormData();
      body.append('file',file);
      body.append('api_key',data.apiKey);
      body.append('timestamp',data.timestamp);
      body.append('folder',data.folder);
      body.append('signature',data.signature);
      const r=await fetch(`https://api.cloudinary.com/v1_1/${data.cloudName}/auto/upload`,{method:'POST',body});
      const outText=await r.text();
      let out:any;
      try{ out=JSON.parse(outText); } catch { throw new Error(`Cloudinary returned something unexpected (HTTP ${r.status}): ${outText.slice(0,300)}`); }
      setLastResponse(JSON.stringify(out,null,2).slice(0,600));
      if(!r.ok) throw new Error(out.error?.message||`Cloudinary rejected the upload (HTTP ${r.status}).`);
      if(!out.secure_url) throw new Error('Cloudinary accepted the file but did not return a URL — see raw response below.');

      setStatus('Uploaded.');
      onUploaded(out.secure_url);
    }catch(e){
      setError(e instanceof Error?e.message:'Upload failed for an unknown reason.');
      setStatus('');
    }finally{
      setBusy(false);
    }
  }

  return <div>
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold shadow-sm hover:border-slate-400">
      <input className="sr-only" type="file" accept={kind==='image'?'image/*':'video/*'} disabled={busy} onChange={e=>{const f=e.target.files?.[0]; if(f) upload(f); e.target.value='';}}/>
      {busy?<LoaderCircle className="animate-spin" size={15}/>:<UploadCloud size={15}/>} {busy?'Working…':`Upload ${kind}`}
    </label>
    {status && <p className="mt-2 text-xs font-medium text-slate-500">{status}</p>}
    {error && <p role="alert" className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>}
    {lastResponse && <details className="mt-2"><summary className="cursor-pointer text-[11px] font-semibold text-slate-400">Show raw Cloudinary response</summary><pre className="mt-1 max-h-40 overflow-auto rounded-lg bg-slate-950 p-2 text-[10px] text-slate-200">{lastResponse}</pre></details>}
  </div>
}
