import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth } from "../firebase";
import "./Members.css";

export default function Members({ roomId }) {
  const [members, setMembers] = useState([]);
  const [creatorId, setCreatorId] = useState(null);
  const db = getFirestore();
  const me = auth.currentUser.uid;

  useEffect(() => {
    async function fetchMembers() {
      const roomSnap = await getDoc(doc(db, "rooms", roomId));
      if (roomSnap.exists()) {
        setCreatorId(roomSnap.data().createdBy);
      }

      const memberCol = collection(db, "rooms", roomId, "members");
      const memberSnap = await getDocs(memberCol);

      const usersData = await Promise.all(
        memberSnap.docs.map(async (memDoc) => {
          const uid = memDoc.id;
          const userSnap = await getDoc(doc(db, "users", uid));
          const data = userSnap.data() || {};

          return {
            uid,
            displayName: data.displayName || "Anonymous",
            email: data.email || "",
          };
        })
      );

      setMembers(usersData);
    }

    fetchMembers();
  }, [db, roomId]);

  return (
    <div className="members-container">
      <h2>Room Members</h2>
      <div className="members-grid">
        {members.map((m) => (
          <div
            key={m.uid}
            className={`member-card ${
              m.uid === creatorId ? "creator" : m.uid === me ? "self" : ""
            }`}
          >
            <span className="member-name">{m.displayName}</span>
            <span className="member-email">{m.email}</span>
            <span className="member-label">
              {m.uid === creatorId ? "Creator" : m.uid === me ? "You" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
