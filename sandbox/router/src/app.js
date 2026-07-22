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
const proxies={};

function getProxy(sandboxId) {
    const targetUrl = `http://sandbox-service-${sandboxId}`;
    if(!proxies[sandboxId]){
        const proxy = createProxyMiddleware({
                    target: targetUrl,
                    changeOrigin: true,
                    ws: true,
                });
        proxies[sandboxId]=proxy;
    }
    return proxies[sandboxId];
}


app.use((req, res, next) => {
  if (req.path.startsWith("/api/status/")) {
    return next();
  }

  const host = req.headers.host;
  const sandboxId = host.split(".")[0];

  return getProxy(sandboxId)(req, res, next);
});

export default app;
