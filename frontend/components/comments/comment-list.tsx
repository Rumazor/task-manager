"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  getCommentsAction,
  createCommentAction,
  deleteCommentAction,
} from "@/components/tasks/actions";

interface Comment {
  id: number;
  content: string;
  author: {
    id: string;
    email: string;
  };
  createdAt: string;
}

interface CommentListProps {
  taskId: number;
  token: string;
  currentUserId: string;
}

export default function CommentList({
  taskId,
  token,
  currentUserId,
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
    const response = await getCommentsAction(taskId, token);
    if (response.success && response.comments) {
      setComments(response.comments);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, [taskId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    const response = await createCommentAction(taskId, newComment, token);
    if (response.success && response.comment) {
      setComments([response.comment, ...comments]);
      setNewComment("");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    const response = await deleteCommentAction(id, token);
    if (response.success) {
      setComments(comments.filter((c) => c.id !== id));
    }
  };

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Escribe un comentario..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={2}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={submitting || !newComment.trim()}>
            <Send className="h-4 w-4 mr-2" />
            {submitting ? "Enviando..." : "Comentar"}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            No hay comentarios aun
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 p-3 bg-muted/30 rounded-lg"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(comment.author.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {comment.author.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  {comment.author.id === currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
