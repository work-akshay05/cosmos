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
      volumes: [
        {
          name: "workspace-volume",
          emptyDir: {},
        }
      ],
      initContainers: [
        {
            name: "init-container",
            image:"akshay5304/template:v5",
            imagePullPolicy: "IfNotPresent",
            command: ["sh", "-c", "cp -r /workspace/. /seed/"],
            volumeMounts: [
                {
                  name: "workspace-volume",
                  mountPath: "/seed",
                }
            ]
        }
      ],
      containers: [
        {
            image: "akshay5304/template:v5",
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
          volumeMounts:[
            {
              name:"workspace-volume",
              mountPath:'/workspace'
            }
          ]
        },
        {
          image: "akshay5304/agent:v1",
          imagePullPolicy: "IfNotPresent",
          name: "agent-container",
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
          volumeMounts:[
            {
              name:"workspace-volume",
              mountPath:'/workspace'
            }
          ]
        },
      ],
    },

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
