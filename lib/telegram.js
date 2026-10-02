export async function telegramJson(token,method,payload){
  const response=await fetch(`https://api.telegram.org/bot${token}/${method}`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  });
  const raw=await response.text();
  try{return JSON.parse(raw)}catch{return{ok:false,description:raw||`HTTP ${response.status}`}}
}

export async function telegramFile(token,method,fields,file){
  const form=new FormData();
  for(const [key,value] of Object.entries(fields||{})){
    if(value!==undefined&&value!==null&&value!=='')form.append(key,typeof value==='object'?JSON.stringify(value):String(value));
  }
  form.append(file.field,new Blob([file.buffer],{type:file.mimeType||'application/octet-stream'}),file.fileName||'file');
  const response=await fetch(`https://api.telegram.org/bot${token}/${method}`,{method:'POST',body:form});
  const raw=await response.text();
  try{return JSON.parse(raw)}catch{return{ok:false,description:raw||`HTTP ${response.status}`}}
}
