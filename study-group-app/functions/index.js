const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

initializeApp();
const db = getFirestore();
const auth = getAuth();

exports.deleteUnverifiedUsers = onSchedule("every 60 minutes", async () => {
  const snapshot = await db.collection("pendingVerifications").get();
  const now = Date.now();

  const promises = snapshot.docs.map(async (docSnap) => {
    const { email } = docSnap.data();
    const uid = docSnap.id;
    const createdAt = docSnap.data().createdAt?.toDate();

    if (!createdAt) return;

    const ageMinutes = (now - createdAt.getTime()) / 60000;

    if (ageMinutes >= 10) {
      try {
        const user = await auth.getUser(uid);
        if (!user.emailVerified) {
          await auth.deleteUser(uid);
          await db.collection("pendingVerifications").doc(uid).delete();
          console.log(`🗑️ Deleted unverified user: ${email}`);
        } else {
          await db.collection("pendingVerifications").doc(uid).delete();
          console.log(`✅ Verified user: ${email} — cleaned up`);
        }
      } catch (error) {
        console.error(`⚠️ Error with ${uid}:`, error.message);
      }
    }
  });

  await Promise.all(promises);
  return null;
});
