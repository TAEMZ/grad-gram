import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  getFirestore,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "../firebase";
import {
  MapPin,
  Building2,
  Briefcase,
  Compass,
  GraduationCap,
  Users,
  Search,
  ExternalLink,
} from "lucide-react";
import "./alumnimap.css";

const DEFAULT_CITIES = [
  "All Destinations",
  "New York, NY",
  "San Francisco Bay Area",
  "Seattle, WA",
  "Austin, TX",
  "Boston, MA",
  "London, UK",
  "Remote / Global",
];

export default function AlumniMap({ roomId }) {
  const [members, setMembers] = useState([]);
  const [selectedCity, setSelectedCity] = useState("All Destinations");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    async function fetchCohortData() {
      try {
        const memberCol = collection(db, "rooms", roomId, "members");
        const memberSnap = await getDocs(memberCol);

        const loadedMembers = await Promise.all(
          memberSnap.docs.map(async (memDoc) => {
            const memberUid = memDoc.id;
            const userSnap = await getDoc(doc(db, "users", memberUid));
            const data = userSnap.data() || {};

            // Derive city from profile or default pool
            const possibleCities = [
              "New York, NY",
              "San Francisco Bay Area",
              "Seattle, WA",
              "Austin, TX",
              "Boston, MA",
              "London, UK",
            ];
            const derivedCity =
              data.city ||
              possibleCities[memberUid.charCodeAt(0) % possibleCities.length];

            return {
              uid: memberUid,
              displayName: data.displayName || "Classmate",
              email: data.email || "",
              nextChapter: data.nextChapter || "Engineering & Innovation",
              city: derivedCity,
              classYear: data.classYear || "2026",
            };
          })
        );

        setMembers(loadedMembers);
      } catch (err) {
        console.error("Error fetching alumni map:", err);
      } finally {
        setLoading(false);
      }
    }

    if (roomId) fetchCohortData();
  }, [roomId]);

  // Aggregate member counts per city
  const cityCounts = members.reduce((acc, m) => {
    acc[m.city] = (acc[m.city] || 0) + 1;
    return acc;
  }, {});

  const filteredMembers = members.filter((m) => {
    const matchesCity =
      selectedCity === "All Destinations" || m.city === selectedCity;
    const matchesSearch =
      m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nextChapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="alumni-map-container animate-fade-in">
      <div className="alumni-header">
        <h2>Alumni Relocation & Career Map 🗺️</h2>
        <p>
          Discover where your graduating class is moving for jobs, graduate school, and future ventures.
        </p>
      </div>

      {/* City Hub Overview Strip */}
      <div className="city-hubs-grid">
        <button
          className={`city-hub-card ${selectedCity === "All Destinations" ? "active" : ""}`}
          onClick={() => setSelectedCity("All Destinations")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Compass size={18} color="var(--gold-primary)" />
            <span className="city-hub-name">All Locations</span>
          </div>
          <span className="city-hub-count">{members.length}</span>
        </button>

        {Object.entries(cityCounts).map(([cityName, count]) => (
          <button
            key={cityName}
            className={`city-hub-card ${selectedCity === cityName ? "active" : ""}`}
            onClick={() => setSelectedCity(cityName)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={16} color="var(--gold-primary)" />
              <span className="city-hub-name">{cityName}</span>
            </div>
            <span className="city-hub-count">{count}</span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: 24, maxWidth: 460 }}>
        <div className="search-input-wrapper">
          <Search size={16} color="var(--slate-400)" />
          <input
            type="text"
            placeholder="Search by name, company, or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="btn-ghost btn-sm" onClick={() => setSearchQuery("")}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Alumni Peer Cards */}
      <motion.div className="alumni-peers-grid" layout>
        <AnimatePresence>
          {filteredMembers.map((peer) => {
            const avatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(
              peer.displayName || peer.uid
            )}&backgroundColor=141924`;

            return (
              <motion.div
                key={peer.uid}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="alumni-peer-card"
              >
                <div>
                  <div className="alumni-peer-top">
                    <img src={avatarUrl} alt={peer.displayName} className="alumni-peer-avatar" />
                    <div className="alumni-peer-info">
                      <h4>{peer.displayName}</h4>
                      <div className="alumni-location-tag">
                        <MapPin size={12} color="var(--gold-primary)" />
                        <span>{peer.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="alumni-destination-pill">
                    <Briefcase size={13} />
                    <span>{peer.nextChapter}</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
                  <span className="badge-titanium">Class of '{peer.classYear.slice(-2)}</span>
                  {peer.email && (
                    <a
                      href={`mailto:${peer.email}`}
                      className="btn btn-secondary btn-sm"
                      style={{ textDecoration: "none" }}
                    >
                      <span>Connect</span>
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
