import { k8sCoreV1Api, k8sNamespace } from "./config.js";

export const createService = async (sandboxId) => {
  const serviceManifest = {
    metadata: {
      name: `sandbox-service-${sandboxId}`,
      labels: {
        app: "sandbox",
        sandboxId: sandboxId,
      },
    },
    spec: {
      selector: {
        sandboxId: sandboxId,
      },
      ports: [
        {
          port: 80,
          targetPort: 5173,
          name: "http",
          protocol: "TCP",
        },
      ],
      type: "ClusterIP",
    },
  };

  const response = await k8sCoreV1Api.createNamespacedService({
    namespace: k8sNamespace,
    body: serviceManifest,
  });

  return response;
};
