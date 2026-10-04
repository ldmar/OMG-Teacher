import { createUser, listUsers, getUser, setCurrentUser, clearCurrentUser, touchUser } from '../core/db.js';

export async function loginWithName(name){
  const clean = name.trim().replace(/\s+/g,' ');
  if(!clean) throw new Error('Nombre vacío');
  const users = await listUsers();
  const found = users.find(u => u.name.toLowerCase() === clean.toLowerCase());
  if(found){
    await touchUser(found.id);
    await setCurrentUser(found.id);
    return found;
  }
  return createUser(clean);
}

export async function switchTo(userId){
  await touchUser(userId);
  await setCurrentUser(userId);
  return getUser(userId);
}

export async function logout(){
  await clearCurrentUser();
}

export { listUsers };