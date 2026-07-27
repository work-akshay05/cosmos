import http from "http";
import app, {
  getAgentProxy,
  getProxy,
  getSandboxIdFromHost,
} from "./src/app.js";

const server = http.createServer(app);

server.on("upgrade", (req, socket, head) => {
  const host = req.headers.host;
  const sandboxId = getSandboxIdFromHost(host);

  if (!sandboxId) {
    socket.destroy();
    return;
  }

  if (host?.includes(".agent.")) {
    getAgentProxy(sandboxId).upgrade(req, socket, head);
    return;
  }

  if (host?.includes(".preview.")) {
    getProxy(sandboxId).upgrade(req, socket, head);
    return;
  }

  socket.destroy();
});

server.listen(3000, () => {
  console.log("Router server is running on port 3000");
});
