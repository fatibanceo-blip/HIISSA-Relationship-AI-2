/** Pure, side-effect-free filters for Founder Staging Employee Register test directory. */
export function filterHiissaEmployeeRegister(rows,{search="",department="all",type="all",status="all"}={}) {
  const query=String(search).trim().toLocaleLowerCase();
  return rows.filter(p=>{
    if(department!=="all"&&p.department!==department)return false;
    if(type!=="all"&&p.engagement_type!==type)return false;
    if(status!=="all"&&p.employment_state!==status)return false;
    return [p.display_name,p.role_label,p.department,p.employee_id].map(s=>String(s??"")).join(" ").toLocaleLowerCase().includes(query);
  });
}
export function summarizeHiissaEmployeeDepartments(rows) {
  const counts=new Map();
  for(const p of rows)if(p.department)counts.set(p.department,(counts.get(p.department)||0)+1);
  return [...counts].map(([name,count])=>({name,count})).sort((a,b)=>a.name.localeCompare(b.name));
}
