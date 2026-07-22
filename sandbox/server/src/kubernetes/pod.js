import { k8sCoreV1Api, k8sNamespace } from "./config.js";

export async function createPod(sandboxId) {
  const podManifest = {
    metadata: {
      name: `sandbox-pod-${sandboxId}`,
      labels: {
        app: "sandbox",
        sandboxId: sandboxId,
      },
    },
    spec: {
      containers: [
        {
            image: "akshay5304/template:v3",
            imagePullPolicy: "IfNotPresent",
          name: "sandbox-container",
          ports: [{ containerPort: 5173, name: "http" }],
          resources: {
            limits: {
              cpu: "500m",
              memory: "1Gi",
            },
            requests: {
              cpu: "250m",
              memory: "512Mi",
            },
          },
        },
      ],
    },
    // kissi or ke pod ko dusra user access kr skta hai
    // usske lie gVisor use krte hai (agar scale chota ho to)
    // varna hum firecracker use krte hai
  };

    console.log("Namespace:", k8sNamespace);
    console.log("API class:", k8sCoreV1Api.constructor.name);
    console.log("Function:", k8sCoreV1Api.createNamespacedPod.toString());

  const response = await k8sCoreV1Api.createNamespacedPod({
    namespace: k8sNamespace,
    body: podManifest,
  });

  return response;
}
