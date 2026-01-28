"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CheckCircle,
  Edit,
  MessageSquare,
  Plus,
  UserPlus,
  Folder,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { getActivityAction, getTaskActivityAction } from "@/components/tasks/actions";

interface Activity {
  id: number;
  action: string;
  description: string;
  changes?: Record<string, any>;
  user: {
    id: string;
    email: string;
  };
  task?: {
    id: number;
    title: string;
  };
  project?: {
    id: number;
    name: string;
  };
  createdAt: string;
}

interface ActivityFeedProps {
  token: string;
  taskId?: number;
  limit?: number;
}

const actionIcons: Record<string, any> = {
  task_created: { icon: Plus, color: "text-green-600 bg-green-100" },
  task_updated: { icon: Edit, color: "text-blue-600 bg-blue-100" },
  task_completed: { icon: CheckCircle, color: "text-green-600 bg-green-100" },
  task_assigned: { icon: UserPlus, color: "text-purple-600 bg-purple-100" },
  comment_added: { icon: MessageSquare, color: "text-orange-600 bg-orange-100" },
  project_created: { icon: Folder, color: "text-indigo-600 bg-indigo-100" },
  project_updated: { icon: Edit, color: "text-indigo-600 bg-indigo-100" },
};

export default function ActivityFeed({
  token,
  taskId,
  limit = 20,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      const response = taskId
        ? await getTaskActivityAction(taskId, token)
        : await getActivityAction(token, limit);

      if (response.success && response.activities) {
        setActivities(response.activities);
      }
      setLoading(false);
    };

    loadActivities();
  }, [token, taskId, limit]);

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No hay actividad reciente</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, index) => {
        const actionConfig = actionIcons[activity.action] || {
          icon: Edit,
          color: "text-gray-600 bg-gray-100",
        };
        const Icon = actionConfig.icon;

        return (
          <div key={activity.id} className="relative flex gap-3 pb-4">
            {/* Timeline line */}
            {index < activities.length - 1 && (
              <div className="absolute left-4 top-10 bottom-0 w-px bg-border" />
            )}

            {/* Icon */}
            <div
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${actionConfig.color}`}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">
                    {getInitials(activity.user.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {activity.user.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                {activity.description}
              </p>

              {activity.task && !taskId && (
                <div className="mt-1">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">
                    {activity.task.title}
                  </span>
                </div>
              )}

              {activity.changes && Object.keys(activity.changes).length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded p-2">
                  {Object.entries(activity.changes).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
