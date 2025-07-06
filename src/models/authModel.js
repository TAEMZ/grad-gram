import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

const auth = getAuth();
const db = getFirestore();

// 🔐 Helper - generate random room key
function generateRandomId() {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
}

// Email login
export const loginUserWithEmail = async ({ email, password }) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Email registration
// registerUserWithEmail
export const registerUserWithEmail = async ({
  email,
  password,
  displayName,
}) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(res.user, { displayName });

  await setDoc(doc(db, "users", res.user.uid), {
    displayName,
    email: res.user.email,
    isPublic: false,
    photoURL: res.user.photoURL || null,
    currentRoom: null,
    createdAt: Date.now(),
  });

  return res;
};

// signInWithGoogle
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  await setDoc(doc(db, "users", user.uid), {
    displayName: user.displayName || "Unknown",
    email: user.email,
    photoURL: user.photoURL || null,
    currentRoom: null,
    isPublic: false,
    createdAt: Date.now(),
  });

  return result;
};

// ✅ Create a Room
export async function createRoomInDatabase(
  uid,
  { university, department, logo }
) {
  const roomKey = generateRandomId();
  const roomRef = doc(db, "rooms", roomKey);

  const roomSnap = await getDoc(roomRef);
  if (roomSnap.exists()) throw new Error("Room already exists. Try again.");

  await setDoc(roomRef, {
    university,
    department,
    logo,
    createdBy: uid,
    createdAt: Date.now(),
    roomKey,
  });

  await setDoc(doc(db, "rooms", roomKey, "members", uid), {
    userId: uid,
    joinedAt: Date.now(),
  });

  await setDoc(
    doc(db, "users", uid),
    {
      currentRoom: roomKey,
      university,
      department,
    },
    { merge: true }
  );

  return roomKey;
}

// ✅ Join Room
export const joinRoom = async (roomKey, uid) => {
  const roomRef = doc(db, "rooms", roomKey);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) throw new Error("Room not found!");

  const roomData = roomSnap.data();

  await setDoc(doc(db, "rooms", roomKey, "members", uid), {
    userId: uid,
    joinedAt: Date.now(),
  });

  await setDoc(
    doc(db, "users", uid),
    {
      currentRoom: roomKey,
      university: roomData.university,
      department: roomData.department,
    },
    { merge: true }
  );
};

// ✅ Check current room
export const checkUserRoom = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;

  const roomKey = userSnap.data().currentRoom;
  if (!roomKey) return null;

  const roomRef = doc(db, "rooms", roomKey);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return null;

  const room = roomSnap.data();
  return {
    key: roomKey,
    ...room,
    isCreator: room.createdBy === uid,
  };
};

// ✅ List joined rooms
export const listJoinedRooms = async (uid) => {
  const roomsRef = collection(db, "rooms");
  const snapshot = await getDocs(roomsRef);
  const rooms = [];

  for (const snap of snapshot.docs) {
    const memberRef = doc(db, "rooms", snap.id, "members", uid);
    const memberSnap = await getDoc(memberRef);
    if (memberSnap.exists()) {
      rooms.push({ id: snap.id, ...snap.data() });
    }
  }

  return rooms;
};

// ✅ List created rooms
export const checkUserCreatedRooms = async (uid) => {
  const q = query(collection(db, "rooms"), where("createdBy", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ✅ Delete room
export const deleteRoomInDatabase = async (roomKey) => {
  const roomRef = doc(db, "rooms", roomKey);

  // Remove room from each member's `currentRoom`
  const membersRef = collection(db, "rooms", roomKey, "members");
  const membersSnap = await getDocs(membersRef);

  for (const member of membersSnap.docs) {
    const userRef = doc(db, "users", member.id);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.currentRoom === roomKey) {
        await setDoc(userRef, { ...data, currentRoom: null });
      }
    }
  }

  // Delete room
  await deleteDoc(roomRef);
};

// ✅ Leave a room
export const leaveRoom = async (roomKey, uid) => {
  await deleteDoc(doc(db, "rooms", roomKey, "members", uid));

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    if (data.currentRoom === roomKey) {
      await setDoc(userRef, { ...data, currentRoom: null });
    }
  }
};
