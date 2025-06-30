import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../backend/firebaseConfig';  // adjust your import path

// 1) Helper to generate a single random code
function randomCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function generateUniqueJoinCode() {
  const groupsCol = collection(db, 'groups');

  for (let attempt = 0; attempt < 50; attempt++) {
    const code = randomCode(8);

    const q = query(groupsCol, where('joinCode', '==', code));
    const snap = await getDocs(q);
    if (snap.empty) {
      return code;
    }
    // else: collision, try again
  }

  throw new Error(`Could not generate a unique code after 50 attempts`);
}
