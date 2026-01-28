"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "./stat-card";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderOpen,
  TrendingUp,
  ListTodo,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  getStatsOverviewAction,
  getStatsByPriorityAction,
  getStatsByProjectAction,
  getWeeklyStatsAction,
} from "@/components/tasks/actions";

interface StatsDashboardProps {
  token: string;
}

const PRIORITY_COLORS = {
  low: "#22C55E",
  medium: "#F59E0B",
  high: "#EF4444",
};

const CHART_COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function StatsDashboard({ token }: StatsDashboardProps) {
  const [overview, setOverview] = useState<any>(null);
  const [priorityStats, setPriorityStats] = useState<any[]>([]);
  const [projectStats, setProjectStats] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const [overviewRes, priorityRes, projectRes, weeklyRes] = await Promise.all([
        getStatsOverviewAction(token),
        getStatsByPriorityAction(token),
        getStatsByProjectAction(token),
        getWeeklyStatsAction(token),
      ]);

      if (overviewRes.success) setOverview(overviewRes.stats);
      if (priorityRes.success) setPriorityStats(priorityRes.stats);
      if (projectRes.success) setProjectStats(projectRes.stats);
      if (weeklyRes.success) setWeeklyStats(weeklyRes.stats);

      setLoading(false);
    };

    loadStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completionData = overview
    ? [
        { name: "Completadas", value: overview.completedTasks, color: "#22C55E" },
        { name: "Pendientes", value: overview.pendingTasks, color: "#3B82F6" },
      ]
    : [];

  const priorityData = priorityStats.map((stat) => ({
    name: stat.priority === "high" ? "Alta" : stat.priority === "medium" ? "Media" : "Baja",
    completadas: stat.completed,
    pendientes: stat.pending,
    fill: PRIORITY_COLORS[stat.priority as keyof typeof PRIORITY_COLORS],
  }));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Tareas"
          value={overview?.totalTasks || 0}
          icon={ListTodo}
          color="primary"
        />
        <StatCard
          title="Completadas"
          value={overview?.completedTasks || 0}
          description={`${overview?.completionRate || 0}% completado`}
          icon={CheckCircle2}
          color="primary"
        />
        <StatCard
          title="Pendientes"
          value={overview?.pendingTasks || 0}
          icon={Clock}
          color="primary"
        />
        <StatCard
          title="Vencidas"
          value={overview?.overdueTasks || 0}
          icon={AlertTriangle}
          color="destructive"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completion Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado de Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tareas por Prioridad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completadas" fill="#22C55E" name="Completadas" />
                  <Bar dataKey="pendientes" fill="#3B82F6" name="Pendientes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Productividad Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="created"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Creadas"
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#22C55E"
                    strokeWidth={2}
                    name="Completadas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Projects Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tareas por Proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {projectStats.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">No hay proyectos</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#22C55E" name="Completadas" />
                    <Bar dataKey="pending" fill="#3B82F6" name="Pendientes" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
