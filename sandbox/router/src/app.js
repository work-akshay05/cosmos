import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
app.use(morgan("dev"));

app.get("/api/status/healthz", (req, res) => {
  res.status(200).json({
    message: "Router is up and running",
  });
});

app.get("/api/status/readyz", (req, res) => {
  res.status(200).json({
    message: "Router is ready to accept requests",
  });
});
const proxies = {};
const agentProxies = {};

function getSandboxIdFromHost(host) {
  return host?.split(".")[0];
}

function getProxy(sandboxId) {
  const targetUrl = `http://sandbox-service-${sandboxId}`;
  if (!proxies[sandboxId]) {
    const proxy = createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      ws: true,

      logLevel: "debug",
      onError(err, req, res) {
        console.log("Proxy error:", err.message);
      },
    });
    proxies[sandboxId] = proxy;
  }
  return proxies[sandboxId];
}

function getAgentProxy(sandboxId) {
  const targetUrl = `http://sandbox-service-${sandboxId}:3000`;
  if (!agentProxies[sandboxId]) {
    const proxy = createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      ws: true,
    });
    agentProxies[sandboxId] = proxy;
  }
  return agentProxies[sandboxId];
}

export { getProxy, getAgentProxy, getSandboxIdFromHost };

app.use((req, res, next) => {
  if (req.path.startsWith("/api/status/")) {
    return next();
  }

  const host = req.headers.host;
  const sandboxId = getSandboxIdFromHost(host);

  if (!sandboxId) {
    return res.status(400).json({
      message: "Missing host header",
    });
  }

  if (host?.includes(".agent.")) {
    return getAgentProxy(sandboxId)(req, res, next);
  }
  if (host?.includes(".preview.")) {
    return getProxy(sandboxId)(req, res, next);
  }

  return res.status(404).json({
    message: "Unknown host",
  });
});

export default app;
