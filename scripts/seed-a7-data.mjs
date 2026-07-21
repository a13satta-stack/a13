/**
 * Seed the database with data in the live A7Satta payload format by POSTing to
 * the running app's /api/import endpoint.
 *
 * Usage:  BASE=http://localhost:3000 PASSWORD=admin123 node scripts/seed-a7-data.mjs
 * Defaults: BASE=http://localhost:3000  PASSWORD=admin123
 *
 * It builds:
 *   - the full game roster in two tables (correct 24h times),
 *   - randomized daily chart history for the whole year up to yesterday,
 *   - the real today/yesterday values from the sample.
 */

const BASE = process.env.BASE || "http://localhost:3000";
const PASSWORD = process.env.PASSWORD || "admin123";

// [name, "HH:MM" 24h, yesterday, today]  (-1 = not declared)
const TABLE1 = [
  ["sadar bazar", "13:40", 1, -1],
  ["gwalior", "14:40", 92, -1],
  ["delhi bazar", "15:15", 18, -1],
  ["delhi matka", "15:40", 48, -1],
  ["shri ganesh", "16:40", 29, -1],
  ["agra", "17:30", 8, -1],
  ["faridabad", "18:10", 91, -1],
  ["alwar", "19:35", 7, -1],
  ["gaziabad", "21:50", 15, -1],
  ["dwarka", "22:35", 73, -1],
  ["gali", "23:50", 77, -1],
];
const TABLE2 = [
  ["hr satta", "12:15", 61, 46],
  ["kkr city", "12:30", 77, 91],
  ["ujjala super", "12:30", 72, -1],
  ["madhupuri", "12:30", 66, -1],
  ["karol bagh", "13:45", 83, -1],
  ["anmol bazar", "14:00", 28, -1],
  ["sky king", "14:00", 61, -1],
  ["delhi darbar", "14:10", 86, -1],
  ["new ganga", "15:30", 51, -1],
  ["fatehabad", "19:00", -1, -1],
  ["raj shree", "19:20", 30, -1],
  ["udaipur city", "19:30", 66, -1],
  ["vip agra", "19:45", 11, -1],
  ["mandi bazar", "20:10", 28, -1],
  ["bhadra bazar", "20:20", 57, -1],
  ["sialkot", "20:20", 2, -1],
  ["lion bazar", "20:30", 89, -1],
  ["mohali-7", "20:40", 22, -1],
  ["dehradun city", "21:40", 68, -1],
  ["daman", "21:50", 50, -1],
];

function pad(n) {
  return String(n).padStart(2, "0");
}

// Build randomized chart history for the year, up to (but not including) yesterday.
function buildChart(now) {
  const chart = { table1: [], table2: [] };
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now);
  end.setDate(end.getDate() - 2); // history stops the day before "yesterday"

  for (const [tableName, roster] of [["table1", TABLE1], ["table2", TABLE2]]) {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const resultDate = `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
      for (const [gameName] of roster) {
        chart[tableName].push({
          gameName,
          result: Math.floor(Math.random() * 100), // 0-99
          resultDate,
          chartTable: tableName,
        });
      }
    }
  }
  return chart;
}

function buildResults() {
  const mk = (roster, table) =>
    roster.map(([gameName, time, yesterday, today]) => ({
      gameName,
      gameResultTime: time,
      yesterday,
      today,
      table,
    }));
  return { table1: mk(TABLE1, "table1"), table2: mk(TABLE2, "table2") };
}

async function main() {
  const now = new Date();
  const payload = {
    results: buildResults(),
    chart: buildChart(now),
    notifications: [
      {
        title: "telegram",
        content:
          '"Now Telegram players can also join our Telegram channel to get results quickly and receive superfast results."',
        status: "Y",
      },
      {
        title: "whatsapp",
        content:
          '"Now WhatsApp players can also join our WhatsApp channel to get results quickly and receive superfast results."',
        status: "Y",
      },
      {
        title: "shri ganesh",
        content: "Shri Ganesh Satta King result is updated everyday at 4:40 PM.",
        status: "Y",
      },
    ],
  };

  // Login to get the session cookie.
  const login = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password: PASSWORD }),
  });
  if (!login.ok) {
    throw new Error(`login failed: ${login.status} ${await login.text()}`);
  }
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error("no session cookie returned");

  const chartRows = payload.chart.table1.length + payload.chart.table2.length;
  console.log(`Importing ${chartRows} chart rows + today/yesterday values…`);

  const res = await fetch(`${BASE}/api/import`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify(payload),
  });
  const out = await res.json();
  console.log("Import response:", JSON.stringify(out));
  if (!res.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
