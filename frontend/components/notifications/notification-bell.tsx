"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Check, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  getNotificationsAction,
  getUnreadNotificationCountAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "@/components/tasks/actions";

interface Notification {
  id: number;
  type: string;
  message: string;
  read: boolean;
  task?: {
    id: number;
    title: string;
  };
  createdAt: string;
}

interface NotificationBellProps {
  token: string;
}

export default function NotificationBell({ token }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    const [notifRes, countRes] = await Promise.all([
      getNotificationsAction(token),
      getUnreadNotificationCountAction(token),
    ]);

    if (notifRes.success && notifRes.notifications) {
      setNotifications(notifRes.notifications);
    }
    if (countRes.success) {
      setUnreadCount(countRes.count);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleMarkAsRead = async (id: number) => {
    await markNotificationAsReadAction(id, token);
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsReadAction(token);
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "bg-blue-100 text-blue-600";
      case "task_completed":
        return "bg-green-100 text-green-600";
      case "comment_added":
        return "bg-purple-100 text-purple-600";
      case "task_due_soon":
        return "bg-yellow-100 text-yellow-600";
      case "task_overdue":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Ver notificaciones"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">Notificaciones</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No hay notificaciones</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                  !notification.read ? "bg-primary/5" : ""
                }`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getNotificationIcon(
                    notification.type
                  )}`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      !notification.read ? "font-medium" : ""
                    }`}
                  >
                    {notification.message}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
