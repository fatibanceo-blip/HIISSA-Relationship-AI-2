// R236: Only a temporary same-origin intent, never an auth credential.
export const ORIGINAL_SUPPORT_RETURN_KEY="hiissa:original-support-return:v1";
export const ORIGINAL_SUPPORT_RETURN_TTL_MS=15*60*1000;
export function markOriginalSupportReturn(storage, now=Date.now()){
 if(!Number.isSafeInteger(now)||now<=0)return false;
 try{storage?.setItem(ORIGINAL_SUPPORT_RETURN_KEY,String(now));return Boolean(storage)}
 catch{return false}
}
export function consumeOriginalSupportReturn(storage, now=Date.now()){
 try{
  if(!storage)return null;
  const raw=storage.getItem(ORIGINAL_SUPPORT_RETURN_KEY);
  storage.removeItem(ORIGINAL_SUPPORT_RETURN_KEY);
  if(!raw||!/^[0-9]{13}$/.test(raw))return null;
  const when=Number(raw);
  if(!Number.isSafeInteger(now)||!Number.isSafeInteger(when)||
     now<when||now-when>ORIGINAL_SUPPORT_RETURN_TTL_MS)return null;
  return "/my-hiissa/support"; // Strict fixed destination. No stored URLs.
 }catch{return null}
}
