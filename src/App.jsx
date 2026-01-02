import { useEffect, useState } from "react";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ92bkZknBs7jBaDDaklzctQ6kUHeh2UC4AhnA4NVMzeefCgIrOxtuEgRYzsyLzaN1HSnVi-shWlDdw/pub?gid=256842994&single=true&output=csv";

const TEAM_STATS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ92bkZknBs7jBaDDaklzctQ6kUHeh2UC4AhnA4NVMzeefCgIrOxtuEgRYzsyLzaN1HSnVi-shWlDdw/pub?gid=727393704&single=true&output=csv";

const GAMES_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ92bkZknBs7jBaDDaklzctQ6kUHeh2UC4AhnA4NVMzeefCgIrOxtuEgRYzsyLzaN1HSnVi-shWlDdw/pub?gid=1191468531&single=true&output=csv";

/**
 * CSV parser that correctly handles quoted commas
 */
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && next === '"') {
      currentCell += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
    } else if (char === "\n" && !inQuotes) {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  currentRow.push(currentCell);
  rows.push(currentRow);

  return rows;
}

/**
 * Format numbers with thousands separators
 */
function fmt(value) {
  const num = Number(value);
  return isNaN(num) ? value : num.toLocaleString();
}

function App() {
  const [rows, setRows] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [games, setGames] = useState([]);
  const [activeTab, setActiveTab] = useState("standings");
  const [expandedTeam, setExpandedTeam] = useState(null);

  useEffect(() => {
    fetch(CSV_URL)
      .then((res) => res.text())
      .then((text) => setRows(parseCSV(text)));
  }, []);

  useEffect(() => {
    fetch(TEAM_STATS_URL)
      .then((res) => res.text())
      .then((text) => setTeamStats(parseCSV(text)));
  }, []);

  useEffect(() => {
    fetch(GAMES_URL)
      .then((res) => res.text())
      .then((text) => setGames(parseCSV(text)));
  }, []);

  if (rows.length <= 1) {
    return <p>Loading...</p>;
  }

  const data = rows.filter(
    (row, index) => index > 0 && !isNaN(parseInt(row[0]))
  );

  const tabStyle = (active) => ({
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: active ? "#111" : "#fff",
    color: active ? "#fff" : "#111",
    fontWeight: 600,
  });

  return (
    <div
      style={{
        padding: "12px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: "8px" }}>Sickos League</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          style={tabStyle(activeTab === "standings")}
          onClick={() => setActiveTab("standings")}
        >
          Standings
        </button>
        <button
          style={tabStyle(activeTab === "teams")}
          onClick={() => setActiveTab("teams")}
        >
          Team Stats
        </button>
        <button
          style={tabStyle(activeTab === "players")}
          onClick={() => setActiveTab("players")}
        >
          Players
        </button>
        <button
          style={tabStyle(activeTab === "games")}
          onClick={() => setActiveTab("games")}
        >
          Today's Games
        </button>
      </div>

      {/* Standings */}
      {activeTab === "standings" && (
        <>
          <h2 style={{ marginTop: 0, color: "#555" }}>Standings</h2>
          {data.map((row, i) => (
            <div
              key={i}
              style={{
                borderBottom: "1px solid #eee",
                padding: "12px 4px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ fontSize: "18px", fontWeight: 600 }}>
                {row[0]}. {row[1]}
              </div>
              <div style={{ fontSize: "15px" }}>
                Total PRA: <strong>{fmt(row[2])}</strong>
              </div>
              {i !== 0 && row[3] && (
                <div style={{ fontSize: "14px", color: "#777" }}>
                  PRA Behind: {fmt(row[3])}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Team Stats */}
      {activeTab === "teams" && (
        <div>
          <h2 style={{ marginTop: 0, color: "#555" }}>Team Stats</h2>
          {teamStats.length <= 1 ? (
            <p>Loading team stats...</p>
          ) : (
            teamStats.slice(1).map((row, i) => {
              const isOpen = expandedTeam === i;
              return (
                <div
                  key={i}
                  style={{
                    borderBottom: "1px solid #eee",
                    padding: "10px 4px",
                  }}
                >
                  <div
                    onClick={() => setExpandedTeam(isOpen ? null : i)}
                    style={{
                      fontSize: "17px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {row[1]} — {fmt(row[2])} PRA
                  </div>
                  <div style={{ fontSize: "14px", color: "#555" }}>
                    PRA/G: {fmt(row[5])} · Games Played: {fmt(row[4])}
                  </div>
                  {isOpen && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "14px",
                        color: "#444",
                      }}
                    >
                      <div>PPG: {fmt(row[6])}</div>
                      <div>RPG: {fmt(row[7])}</div>
                      <div>APG: {fmt(row[8])}</div>
                      <div>Games Remaining Today: {fmt(row[9])}</div>
                      <div>Games Remaining Total: {fmt(row[10])}</div>
                      <div>PRA Last Week: {fmt(row[11])}</div>
                      <div>PRA This Week: {fmt(row[12])}</div>
                      <div>PRA/G (Last 7 Days): {fmt(row[13])}</div>
                      <div>Season DNPs: {fmt(row[14])}</div>
                      <div>Next Game (CT): {row[15]}</div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Today's Games */}
      {activeTab === "games" && (
        <div>
          <h2 style={{ marginTop: 0, color: "#555" }}>Today's Games</h2>
          {games.length <= 1 ? (
            <p>Loading games...</p>
          ) : (
            games.slice(1).map((row, i) => (
              <div
                key={i}
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "12px",
                  marginBottom: "6px",
                  borderRadius: "8px",
                  backgroundColor: "#fafafa",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "16px" }}>
                  {row[0]} — {row[2]} ({row[1]}) vs {row[6]}
                </div>
                <div style={{ fontSize: "14px", color: "#555", marginTop: "4px" }}>
                  School: {row[4]} · Conf: {row[5]} · H/A: {row[7]} · Location: {row[8]}
                </div>
                <div style={{ fontSize: "14px", color: "#555", marginTop: "2px" }}>
                  TV: {row[9]} · PRA: {fmt(row[10])} · Box Score: {row[11]} · Status: {row[12]}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Players */}
      {activeTab === "players" && (
        <p style={{ color: "#555" }}>Player stats coming soon.</p>
      )}
    </div>
  );
}

export default App;
