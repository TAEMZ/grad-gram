import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, updateDoc, doc, increment } from 'firebase/firestore';
import { db, auth } from '../firebase';
import './Awards.css';

const CATEGORIES = [
    "Most Likely to Be CEO",
    "Class Clown",
    "Best Dressed",
    "Most Likely to Change the World",
    "Life of the Party"
];

function Awards({ roomId }) {
    const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
    const [votes, setVotes] = useState({}); // Local vote tracking to prevent spam
    const [nominees, setNominees] = useState([]); // State for real members

    useEffect(() => {
        async function fetchNominees() {
            const memberCol = collection(db, "rooms", roomId, "members");
            const memberSnap = await getDocs(memberCol);

            const membersData = await Promise.all(
                memberSnap.docs.map(async (memDoc) => {
                    const uid = memDoc.id;
                    const userSnap = await getDoc(doc(db, "users", uid));
                    const data = userSnap.data() || {};
                    return {
                        id: uid,
                        name: data.displayName || "Anonymous",
                        votes: 0 // In real app, fetch this from a 'votes' subcollection
                    };
                })
            );
            setNominees(membersData);
        }
        fetchNominees();
    }, [roomId]);

    const handleVote = (nomineeId) => {
        // In a real app, write to Firestore subcollection 'votes'
        // For demo: just visually increment
        setVotes(prev => ({
            ...prev,
            [nomineeId]: (prev[nomineeId] || 0) + 1
        }));
    };

    return (
        <div className="awards-container animate-fade-in">
            <div className="awards-header">
                <h2 className="awards-title">Senior Superlatives</h2>
                <p className="awards-subtitle">Cast your votes for the class of '24 legends.</p>
            </div>

            <div className="categories-list">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="nominees-grid">
                {nominees.map(nominee => (
                    <div key={nominee.id} className="nominee-card glass-card">
                        <div className="nominee-avatar-placeholder">
                            {nominee.name[0]}
                        </div>
                        <h3 className="nominee-name">{nominee.name}</h3>
                        <div className="vote-count">
                            {(votes[nominee.id] || 0) + nominee.votes} Votes
                        </div>
                        <button
                            className="vote-btn"
                            onClick={() => handleVote(nominee.id)}
                        >
                            Vote 🌟
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Awards;
