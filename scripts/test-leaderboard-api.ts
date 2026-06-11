async function main() {
  const res = await fetch("http://localhost:3000/api/leaderboard");
  const data = await res.json();
  console.log("status", res.status);
  console.log("listeners", data.listeners?.length ?? 0);
  console.log("artists", data.artists?.length ?? 0);
  if (data.error) console.log("error", data.error);
  if (data.listeners?.[0]) console.log("top listener", data.listeners[0]);
  if (data.artists?.[0]) console.log("top artist", data.artists[0]);
}

main().catch(console.error);
