import net from "net";
import fetch from "node-fetch";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY!;
const PORT = process.env.LOG_TCP_PORT || 34302;

const server = net.createServer(socket => {
  console.log(`📡 Connected: ${socket.remoteAddress}`);

  socket.on("data", async chunk => {
    const logLine = chunk.toString().trim();
    console.log("🪵 Log:", logLine);

    // Forward to Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/render_logs`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ log: logLine }),
    });
  });

  socket.on("end", () => console.log("❌ Disconnected"));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Listening for Render logs on tcp://0.0.0.0:${PORT}`);
});
