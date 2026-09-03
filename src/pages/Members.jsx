import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth } from "../firebase";
import { Users, Compass, Shield, Award } from "lucide-react";
import "./Members.css";

export default function Members({ roomId }) {
  const [members, setMembers] = useState([]);
  const [creatorId, setCreatorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const me = auth.currentUser?.uid;

  useEffect(() => {
    async function fetchMembers() {
      try {
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
              displayName: data.displayName || "Classmate",
              email: data.email || "",
              nextChapter: data.nextChapter || (data.bio ? data.bio.slice(0, 30) : "Preparing next chapter"),
              classYear: data.classYear || "2026",
            };
          })
        );

        setMembers(usersData);
      } catch (err) {
        console.error("Error loading members:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [db, roomId]);

  return (
    <div className="members-container animate-fade-in">
      <div className="members-header">
        <h2>Classmate Directory</h2>
        <p>Registered cohort peers and digital yearbook contributors ({members.length} members)</p>
      </div>

      <div className="members-grid">
        {members.map((m) => {
          const avatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(
            m.displayName || m.uid
          )}&backgroundColor=141924`;

          return (
            <div
              key={m.uid}
              className={`member-card ${
                m.uid === creatorId ? "creator" : m.uid === me ? "self" : ""
              }`}
            >
              <img src={avatarUrl} alt={m.displayName} className="member-avatar-img" />
              <div>
                <span className="member-name">{m.displayName}</span>
                {m.email && <span className="member-email">{m.email}</span>}
              </div>
              <div className="member-next-chapter">
                <Compass size={13} />
                <span>{m.nextChapter}</span>
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 4 }}>
                <span className="badge-titanium">Class of '{m.classYear.slice(-2)}</span>
                {m.uid === creatorId && (
                  <span className="badge-gold">
                    <Shield size={11} />
                    <span>Lead</span>
                  </span>
                )}
                {m.uid === me && m.uid !== creatorId && (
                  <span className="badge-titanium">You</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
