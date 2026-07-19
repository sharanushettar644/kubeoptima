const http = require('http');

const PORT = 9090;
const AI_SERVICE_URL = 'http://localhost:8000';

const requestAI = (path, callback, fallbackData) => {
  const url = `${AI_SERVICE_URL}${path}`;
  http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        if (res.statusCode === 200) {
          callback(res.statusCode, JSON.parse(data));
        } else {
          callback(200, fallbackData);
        }
      } catch (err) {
        callback(200, fallbackData);
      }
    });
  }).on('error', () => {
    callback(200, fallbackData);
  });
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  console.log(`[${new Date().toISOString()}] ${req.method} ${path}`);

  // Health / Readiness check
  if (path === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'running', service: 'KubeOptima API Gateway', version: '1.0.0', gatewayPort: PORT }));
    return;
  }
  if (path === '/healthz') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
    return;
  }
  if (path === '/readyz') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ready', time: new Date().toISOString() }));
    return;
  }

  // --- API v1 ---
  // Clusters
  if (path === '/api/v1/clusters') {
    res.writeHead(200);
    res.end(JSON.stringify([
      { id: 'prod-us-east-1', name: 'prod-us-east-1', provider: 'aws', region: 'us-east-1', nodes: 42, status: 'connected' },
      { id: 'prod-us-west-2', name: 'prod-us-west-2', provider: 'aws', region: 'us-west-2', nodes: 28, status: 'connected' },
      { id: 'staging-eu-west-1', name: 'staging-eu-west-1', provider: 'aws', region: 'eu-west-1', nodes: 15, status: 'connected' }
    ]));
    return;
  }

  if (path.startsWith('/api/v1/clusters/') && path.endsWith('/nodes')) {
    res.writeHead(200);
    res.end(JSON.stringify([
      { name: 'node-1', type: 't3.medium', status: 'Ready', cpu: '55%', mem: '62%' },
      { name: 'node-2', type: 't3.medium', status: 'Ready', cpu: '42%', mem: '51%' }
    ]));
    return;
  }

  if (path.startsWith('/api/v1/clusters/') && path.endsWith('/pods')) {
    res.writeHead(200);
    res.end(JSON.stringify([
      { name: 'api-server-xyz', namespace: 'production', status: 'Running', cpu: '120m', mem: '256Mi' },
      { name: 'dashboard-abc', namespace: 'kubeoptima', status: 'Running', cpu: '45m', mem: '90Mi' }
    ]));
    return;
  }

  if (path.startsWith('/api/v1/clusters/') && path.endsWith('/metrics')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      cpu_utilization: 58.5,
      memory_utilization: 64.2,
      network_in_mbps: 142.5,
      network_out_mbps: 98.2
    }));
    return;
  }

  if (path.startsWith('/api/v1/clusters/') && path.endsWith('/health')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      score: 94,
      status: 'healthy',
      conditions: ['ControlPlaneHealthy', 'NodeGroupsHealthy', 'AddonsHealthy']
    }));
    return;
  }

  if (path.startsWith('/api/v1/clusters/')) {
    const parts = path.split('/');
    const clusterID = parts[4];
    res.writeHead(200);
    res.end(JSON.stringify({
      id: clusterID, name: clusterID, provider: 'aws', region: 'us-east-1', nodes: 42, status: 'connected'
    }));
    return;
  }

  // Recommendations
  if (path === '/api/v1/recommendations') {
    requestAI('/api/v1/recommendations/', (code, data) => {
      res.writeHead(code);
      res.end(JSON.stringify(data));
    }, [
      {
        id: 'rec-1', type: 'rightsizing', title: 'Downsize API pods — CPU over-provisioned 4×',
        namespace: 'production', workload_name: 'api-server', impact: 'high', saving: '$2,840/mo', confidence: 0.94, risk_level: 'low'
      },
      {
        id: 'rec-2', type: 'spot', title: 'Migrate stateless workers to Spot',
        namespace: 'processing', workload_name: 'batch-workers', impact: 'high', saving: '$5,120/mo', confidence: 0.88, risk_level: 'medium'
      }
    ]);
    return;
  }

  if (path.startsWith('/api/v1/recommendations/')) {
    const parts = path.split('/');
    const id = parts[4];
    if (parts[5] === 'apply') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'applied', id: id, applied_at: new Date().toISOString() }));
      return;
    }
    if (parts[5] === 'dismiss') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'dismissed', id: id }));
      return;
    }
    if (parts[5] === 'schedule') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'scheduled', id: id }));
      return;
    }
    requestAI(`/api/v1/recommendations/${id}`, (code, data) => {
      res.writeHead(code);
      res.end(JSON.stringify(data));
    }, { id: id, title: 'Recommendation Detail' });
    return;
  }

  // Rightsizing
  if (path === '/api/v1/rightsizing/pods') {
    requestAI('/api/v1/rightsizing/pods', (code, data) => {
      res.writeHead(code);
      res.end(JSON.stringify(data));
    }, [
      { name: 'api-server', cpu: 800, recommended_cpu: 250, mem: 1024, recommended_mem: 400 }
    ]);
    return;
  }

  if (path === '/api/v1/rightsizing/nodes') {
    requestAI('/api/v1/rightsizing/nodes', (code, data) => {
      res.writeHead(code);
      res.end(JSON.stringify(data));
    }, [
      { current: 'm5.4xlarge', recommended: 'c7g.2xlarge', saving: '$340/mo' }
    ]);
    return;
  }

  if (path.startsWith('/api/v1/rightsizing/pods/')) {
    const parts = path.split('/');
    const namespace = parts[5];
    const name = parts[6];
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'success', namespace: namespace, name: name }));
    return;
  }

  if (path.startsWith('/api/v1/rightsizing/nodes/') && path.endsWith('/migrate')) {
    const parts = path.split('/');
    const name = parts[5];
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'migration_triggered', node: name }));
    return;
  }

  // Autoscaling
  if (path === '/api/v1/autoscaling/forecast') {
    res.writeHead(200);
    res.end(JSON.stringify({
      forecast: [
        { time: '12:00', load: 45 },
        { time: '13:00', load: 52 }
      ]
    }));
    return;
  }

  if (path === '/api/v1/autoscaling/events') {
    res.writeHead(200);
    res.end(JSON.stringify([
      { time: '09:00', type: 'scale-up', nodes: '+3', reason: 'Morning traffic spike' }
    ]));
    return;
  }

  if (path === '/api/v1/autoscaling/override') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'override_active' }));
    return;
  }

  // Migrations
  if (path === '/api/v1/migrations') {
    res.writeHead(200);
    res.end(JSON.stringify([
      { id: 'mig-1', pod: 'api-server-6d4f8b-x2k9p', status: 'running', progress: 72 }
    ]));
    return;
  }

  if (path.startsWith('/api/v1/migrations/')) {
    const parts = path.split('/');
    const id = parts[4];
    res.writeHead(200);
    res.end(JSON.stringify({ id: id, pod: 'api-server-6d4f8b-x2k9p', status: 'running' }));
    return;
  }

  // Costs
  if (path === '/api/v1/costs/current') {
    requestAI('/api/v1/cost/current', (code, data) => {
      res.writeHead(code);
      res.end(JSON.stringify(data));
    }, { mtd_spend: 49600.0, mtd_savings: 18400.0 });
    return;
  }

  if (path === '/api/v1/costs/forecast') {
    requestAI('/api/v1/cost/forecast', (code, data) => {
      res.writeHead(code);
      res.end(JSON.stringify(data));
    }, { projected_cost: 52000.0, savings_potential: 18800.0 });
    return;
  }

  if (path === '/api/v1/costs/breakdown') {
    requestAI('/api/v1/cost/breakdown', (code, data) => {
      res.writeHead(code);
      res.end(JSON.stringify(data));
    }, [
      { service: 'Compute', cost: 28400 },
      { service: 'Storage', cost: 4200 }
    ]);
    return;
  }

  if (path === '/api/v1/costs/savings') {
    requestAI('/api/v1/cost/savings', (code, data) => {
      res.writeHead(code);
      res.end(JSON.stringify(data));
    }, [
      { month: 'Jun', savings: 31200 },
      { month: 'Jul', savings: 38900 }
    ]);
    return;
  }

  // Failures
  if (path === '/api/v1/failures/predictions') {
    requestAI('/api/v1/failure/?cluster_id=prod-us-east-1', (code, data) => {
      res.writeHead(code);
      res.end(JSON.stringify(data));
    }, [
      { id: 'fp-1', node: 'node-1', type: 'OOM', probability: 94, eta: '12m' }
    ]);
    return;
  }

  if (path.startsWith('/api/v1/failures/') && path.endsWith('/acknowledge')) {
    const parts = path.split('/');
    const id = parts[4];
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'acknowledged', id: id }));
    return;
  }

  // Policies
  if (path === '/api/v1/policies') {
    res.writeHead(200);
    res.end(JSON.stringify([
      { id: 'pol-1', name: 'production-policy', mode: 'autonomous', enabled: true }
    ]));
    return;
  }

  if (path.startsWith('/api/v1/policies/')) {
    const parts = path.split('/');
    const id = parts[4];
    res.writeHead(200);
    res.end(JSON.stringify({ id: id, name: 'production-policy', mode: 'autonomous' }));
    return;
  }

  // Spot / Failures
  if (path === '/api/v1/spot/predictions') {
    requestAI('/api/v1/spot/predictions', (code, data) => {
      if (code === 200 && Array.isArray(data)) {
        const mapped = data.map(item => ({
          type: item.instance_type,
          az: item.availability_zone,
          spotPrice: item.current_spot_price_usd,
          onDemand: item.on_demand_price_usd,
          saving: `${item.saving_percent.toFixed(0)}%`,
          interruptProb: Math.round(item.interruption_probability * 100),
          status: item.safe_to_migrate ? 'safe' : 'watch'
        }));
        res.writeHead(200);
        res.end(JSON.stringify(mapped));
      } else {
        res.writeHead(200);
        res.end(JSON.stringify([
          { type: "c5.2xlarge", az: "us-east-1a", spotPrice: 0.082, onDemand: 0.340, saving: "76%", interruptProb: 8, status: "safe" },
          { type: "m5.xlarge", az: "us-east-1b", spotPrice: 0.045, onDemand: 0.192, saving: "77%", interruptProb: 14, status: "safe" },
          { type: "r5.large", az: "us-east-1c", spotPrice: 0.038, onDemand: 0.126, saving: "70%", interruptProb: 22, status: "watch" }
        ]));
      }
    }, [
      { type: "c5.2xlarge", az: "us-east-1a", spotPrice: 0.082, onDemand: 0.340, saving: "76%", interruptProb: 8, status: "safe" },
      { type: "m5.xlarge", az: "us-east-1b", spotPrice: 0.045, onDemand: 0.192, saving: "77%", interruptProb: 14, status: "safe" },
      { type: "r5.large", az: "us-east-1c", spotPrice: 0.038, onDemand: 0.126, saving: "70%", interruptProb: 22, status: "watch" }
    ]);
    return;
  }

  // AI Explain
  if (path.startsWith('/api/v1/explain/')) {
    const parts = path.split('/');
    const recID = parts[4];
    res.writeHead(200);
    res.end(JSON.stringify({
      recommendation_id: recID,
      explanation: 'Calculated via SHAP values showing high CPU request sizing over-provisioning.'
    }));
    return;
  }

  // Audit Log
  if (path === '/api/v1/audit') {
    res.writeHead(200);
    res.end(JSON.stringify([
      { time: '4m ago', event: 'In-place CPU resize applied', user: 'admin' }
    ]));
    return;
  }

  // Default fallback 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 KubeOptima Mock API Gateway listening on :${PORT}`);
  console.log(`📡 Mirroring data and forwarding queries to AI ML Service at ${AI_SERVICE_URL}`);
});
