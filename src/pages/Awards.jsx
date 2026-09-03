import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { Trophy, Sparkles, Check } from "lucide-react";
import "./Awards.css";

const CATEGORIES = [
  "Most Likely to Be CEO",
  "Class Visionary",
  "Best Team Player",
  "Most Likely to Change the World",
  "Creative Maverick",
  "Life of the Cohort",
];

// Helper to create safe Firestore doc ID
const slugifyCategory = (cat) => cat.toLowerCase().replace(/[^a-z0-9]/g, "_");

function Awards({ roomId }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [nominees, setNominees] = useState([]);
  const [categoryVotes, setCategoryVotes] = useState({}); // { [categorySlug]: { [nomineeId]: count, userVotedFor: nomineeId } }
  const [loading, setLoading] = useState(true);

  const uid = auth.currentUser?.uid;

  // 1. Fetch cohort members as nominees
  useEffect(() => {
    async function fetchNominees() {
      try {
        const memberCol = collection(db, "rooms", roomId, "members");
        const memberSnap = await getDocs(memberCol);

        const membersData = await Promise.all(
          memberSnap.docs.map(async (memDoc) => {
            const memberId = memDoc.id;
            const userSnap = await getDoc(doc(db, "users", memberId));
            const data = userSnap.data() || {};
            return {
              id: memberId,
              name: data.displayName || "Classmate",
            };
          })
        );
        setNominees(membersData);
      } catch (err) {
        console.error("Error loading nominees:", err);
      } finally {
        setLoading(false);
      }
    }

    if (roomId) fetchNominees();
  }, [roomId]);

  // 2. Real-time listener for all awards categories in this room
  useEffect(() => {
    if (!roomId) return;

    const awardsCol = collection(db, "rooms", roomId, "awards");
    const unsubscribe = onSnapshot(awardsCol, (snapshot) => {
      const votesMap = {};

      snapshot.docs.forEach((d) => {
        const data = d.data() || {};
        const voters = data.voters || {}; // { [userId]: nomineeId }
        const tallies = {};
        let userChoice = null;

        Object.entries(voters).forEach(([voterUid, nomineeId]) => {
          tallies[nomineeId] = (tallies[nomineeId] || 0) + 1;
          if (voterUid === uid) {
            userChoice = nomineeId;
          }
        });

        votesMap[d.id] = {
          tallies,
          userChoice,
        };
      });

      setCategoryVotes(votesMap);
    });

    return () => unsubscribe();
  }, [roomId, uid]);

  // 3. Handle casting / toggling a vote
  const handleVote = async (nomineeId) => {
    if (!uid) return;

    const catSlug = slugifyCategory(activeCategory);
    const awardDocRef = doc(db, "rooms", roomId, "awards", catSlug);

    try {
      const awardSnap = await getDoc(awardDocRef);
      const data = awardSnap.exists() ? awardSnap.data() : {};
      const voters = { ...(data.voters || {}) };

      if (voters[uid] === nomineeId) {
        delete voters[uid]; // Toggle off if clicking the same nominee
      } else {
        voters[uid] = nomineeId; // Cast or switch vote
      }

      await setDoc(
        awardDocRef,
        {
          categoryName: activeCategory,
          voters,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to record vote:", err);
    }
  };

  const currentCatSlug = slugifyCategory(activeCategory);
  const currentCategoryData = categoryVotes[currentCatSlug] || {
    tallies: {},
    userChoice: null,
  };

  return (
    <div className="awards-container animate-fade-in">
      <div className="awards-header">
        <h2>Senior Superlatives & Honors</h2>
        <p>Real-time voting for outstanding graduating cohort members</p>
      </div>

      <div className="categories-list">
        {CATEGORIES.map((cat) => {
          const slug = slugifyCategory(cat);
          const hasVotedInCat = !!categoryVotes[slug]?.userChoice;

          return (
            <button
              key={cat}
              className={`category-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              <span>{cat}</span>
              {hasVotedInCat && <span style={{ marginLeft: 4 }}>✓</span>}
            </button>
          );
        })}
      </div>

      {nominees.length === 0 && !loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
          No cohort members found yet. Invite classmates to start superlative voting.
        </div>
      ) : (
        <div className="nominees-grid">
          {nominees.map((nominee) => {
            const avatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(
              nominee.name || nominee.id
            )}&backgroundColor=141924`;

            const count = currentCategoryData.tallies[nominee.id] || 0;
            const isUserChoice = currentCategoryData.userChoice === nominee.id;

            return (
              <div key={nominee.id} className="nominee-card">
                <img src={avatarUrl} alt={nominee.name} className="nominee-avatar-img" />
                <h3 className="nominee-name">{nominee.name}</h3>

                <div className="vote-tally-badge">
                  <Trophy size={13} />
                  <span>{count} {count === 1 ? "Vote" : "Votes"}</span>
                </div>

                <button
                  className={`btn ${isUserChoice ? "btn-primary" : "btn-secondary"} btn-sm`}
                  style={{ width: "100%", marginTop: 8 }}
                  onClick={() => handleVote(nominee.id)}
                >
                  {isUserChoice ? (
                    <>
                      <Check size={14} color="#0d0f14" />
                      <span>Your Vote</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Vote</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Awards;
