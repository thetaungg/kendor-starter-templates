# Deploy with Kubernetes and Helm

Your sandbox has a single-node Kubernetes cluster (k3s) running on its own Docker daemon, with
`kubectl` and `helm`. `app/` is a small HTTP service; `chart/` is a Helm chart for it that isn't finished.

```bash
kubectl get nodes
docker build -t orders-api:dev app      # the cluster uses images from this Docker as they are
helm install orders ./chart
kubectl get pods -w
```

The `cluster` service keeps a port-forward to `svc/orders-api` running, so the preview shows the app as
soon as your Service exists.

To open anything else in the preview, forward it with `--address 0.0.0.0`:
`kubectl port-forward svc/<name> 8080:80 --address 0.0.0.0`. Without it, kubectl listens on localhost only
and the port never shows up in the preview.

## Your task

1. **Finish the chart.** The Deployment takes its replica count, image and resources from `values.yaml`,
   and there is no Service yet. Add one so `kubectl port-forward svc/orders-api 3000:80` works.
2. **Health.** The app serves `/healthz` and `/readyz`; `/readyz` fails for the first 10 seconds while it
   warms up. Add probes so no traffic reaches a pod before it is ready.
3. **Configuration.** Move `GREETING` into a ConfigMap and roll the pods automatically when it changes.
4. **Rollout.** Scale to three replicas and do a rolling update to a new image tag with no failed
   requests. Be ready to explain how you'd roll back.
