'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { Key, Monitor, Package, Users } from 'lucide-react';

export default function Dashboard() {
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(1, 100),
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.getProducts(1, 100),
  });

  const { data: licenses } = useQuery({
    queryKey: ['licenses'],
    queryFn: () => apiClient.getLicenses(1, 100),
  });

  const { data: machines } = useQuery({
    queryKey: ['machines'],
    queryFn: () => apiClient.getMachines(1, 100),
  });

  const stats = [
    {
      title: 'Total Users',
      value: users?.data?.length || 0,
      icon: Users,
      description: 'Registered users',
    },
    {
      title: 'Products',
      value: products?.data?.length || 0,
      icon: Package,
      description: 'Available products',
    },
    {
      title: 'Active Licenses',
      value: licenses?.data?.filter((l: any) => l.attributes.status === 'active').length || 0,
      icon: Key,
      description: 'Currently active',
    },
    {
      title: 'Machines',
      value: machines?.data?.length || 0,
      icon: Monitor,
      description: 'Registered machines',
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your Keygen licensing server
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <Key className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New license created</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">User registered</p>
                    <p className="text-xs text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                    <Monitor className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Machine activated</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">License Utilization</span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Users</span>
                <span className="text-sm font-medium">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Server Health</span>
                <span className="text-sm font-medium text-green-600">Good</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}