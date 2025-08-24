import React, { useState, useEffect } from 'react';
import CardComponent from '@/components/CardComponent';
import { 
  Server, 
  Database, 
  Cpu, 
  MemoryStick,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SystemMetrics {
  server: {
    status: 'healthy' | 'warning' | 'error';
    uptime: string;
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  database: {
    status: 'healthy' | 'warning' | 'error';
    connections: number;
    maxConnections: number;
    queryTime: number;
    size: string;
  };
  services: Array<{
    name: string;
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
  }>;
  alerts: Array<{
    id: number;
    type: 'warning' | 'info' | 'error';
    message: string;
    timestamp: string;
  }>;
}

// Temporary data service
const getSystemMetrics = (): SystemMetrics => ({
  server: {
    status: 'healthy',
    uptime: '15d 4h 32m',
    cpu: 45,
    memory: 68,
    disk: 32,
    network: 89
  },
  database: {
    status: 'healthy',
    connections: 24,
    maxConnections: 100,
    queryTime: 23,
    size: '2.4 GB'
  },
  services: [
    { name: 'Authentication Service', status: 'healthy', responseTime: 120 },
    { name: 'Image Processing Service', status: 'warning', responseTime: 450 },
    { name: 'File Storage Service', status: 'healthy', responseTime: 89 },
    { name: 'Notification Service', status: 'healthy', responseTime: 156 }
  ],
  alerts: [
    { 
      id: 1, 
      type: 'warning', 
      message: 'High memory usage detected on server-01', 
      timestamp: '2024-01-15 14:30:00' 
    },
    { 
      id: 2, 
      type: 'info', 
      message: 'Database backup completed successfully', 
      timestamp: '2024-01-15 14:00:00' 
    }
  ]
});

export default function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics>(getSystemMetrics());
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getSystemMetrics());
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      healthy: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs',
      warning: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs',
      error: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs'
    };
    return <span className={colors[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs'}>{status}</span>;
  };

  const ProgressBar = ({ value, className = "" }: { value: number; className?: string }) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-[var(--arabica-brown)] h-2 rounded-full transition-all duration-300" 
        style={{ width: `${value}%` }}
      />
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--espresso-black)]">System Monitoring</h1>
        <div className="text-sm text-gray-600">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardComponent
          item={{
            title: "Server Status",
            subtitle: "",
            content: (
              <div className="flex flex-col items-center space-y-2">
                <Server className="h-8 w-8 text-gray-600" />
                <div className="flex items-center space-x-2">
                  {getStatusIcon(metrics.server.status)}
                  <span className="text-xl font-bold capitalize">{metrics.server.status}</span>
                </div>
              </div>
            ),
            description: `Uptime: ${metrics.server.uptime}`
          }}
        />

        <CardComponent
          item={{
            title: "CPU Usage",
            subtitle: "",
            content: (
              <div className="flex flex-col items-center space-y-2 w-full">
                <Cpu className="h-8 w-8 text-gray-600" />
                <div className="text-2xl font-bold">{metrics.server.cpu}%</div>
                <ProgressBar value={metrics.server.cpu} className="w-full" />
              </div>
            )
          }}
        />

        <CardComponent
          item={{
            title: "Memory Usage",
            subtitle: "",
            content: (
              <div className="flex flex-col items-center space-y-2 w-full">
                <MemoryStick className="h-8 w-8 text-gray-600" />
                <div className="text-2xl font-bold">{metrics.server.memory}%</div>
                <ProgressBar value={metrics.server.memory} className="w-full" />
              </div>
            )
          }}
        />

        <CardComponent
          item={{
            title: "Disk Usage",
            subtitle: "",
            content: (
              <div className="flex flex-col items-center space-y-2 w-full">
                <HardDrive className="h-8 w-8 text-gray-600" />
                <div className="text-2xl font-bold">{metrics.server.disk}%</div>
                <ProgressBar value={metrics.server.disk} className="w-full" />
              </div>
            )
          }}
        />
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-2 border-b">
          {['services', 'database', 'alerts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm capitalize ${
                activeTab === tab 
                  ? 'border-b-2 border-[var(--arabica-brown)] text-[var(--arabica-brown)]' 
                  : 'text-gray-600 hover:text-[var(--arabica-brown)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'services' && (
          <CardComponent
            item={{
              title: "Service Status",
              subtitle: "",
              content: (
                <div className="space-y-4 w-full">
                  {metrics.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-gray-600">
                            Response time: {service.responseTime}ms
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>
                  ))}
                </div>
              )
            }}
          />
        )}

        {activeTab === 'database' && (
          <CardComponent
            item={{
              title: "Database Metrics",
              subtitle: "",
              content: (
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="text-center">
                    <Database className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <h4 className="font-medium mb-2">Connections</h4>
                    <div className="text-2xl font-bold">{metrics.database.connections}</div>
                    <ProgressBar 
                      value={(metrics.database.connections / metrics.database.maxConnections) * 100} 
                      className="mt-2" 
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Max: {metrics.database.maxConnections}
                    </p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium mb-2">Avg Query Time</h4>
                    <div className="text-2xl font-bold">{metrics.database.queryTime}ms</div>
                    <p className="text-xs text-gray-600 mt-1">
                      Database size: {metrics.database.size}
                    </p>
                  </div>
                </div>
              )
            }}
          />
        )}

        {activeTab === 'alerts' && (
          <CardComponent
            item={{
              title: "System Alerts",
              subtitle: "",
              content: (
                <div className="space-y-3 w-full">
                  {metrics.alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-4 border rounded-lg ${
                        alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <span className="text-sm">{alert.message}</span>
                            <span className="text-xs text-gray-500">{alert.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }}
          />
        )}
      </div>
    </div>
  );
}
