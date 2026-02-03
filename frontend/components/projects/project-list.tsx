"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, FolderOpen, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/lib/types";
import { getProjectsAction, deleteProjectAction } from "@/components/tasks/actions";
import ProjectForm from "./project-form";

interface ProjectListProps {
  token: string;
  selectedProjectId?: number;
  onProjectSelect: (project: Project | null) => void;
}

export default function ProjectList({
  token,
  selectedProjectId,
  onProjectSelect,
}: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    const response = await getProjectsAction(token);
    if (response.success && response.projects) {
      setProjects(response.projects);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, [token]);

  const handleDelete = async (id: number) => {
    const response = await deleteProjectAction(id, token);
    if (response.success) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProjectId === id) {
        onProjectSelect(null);
      }
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProject(null);
    loadProjects();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Proyectos
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => setShowForm(true)}
          aria-label="Nuevo proyecto"
          title="Nuevo proyecto"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {showForm && (
        <ProjectForm
          token={token}
          project={editingProject}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}

      <div className="space-y-1">
        <Button
          variant={selectedProjectId === undefined ? "secondary" : "ghost"}
          className="w-full justify-start h-9"
          onClick={() => onProjectSelect(null)}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Todas las tareas
        </Button>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          projects.map((project) => {
            const progress =
              project.taskCount && project.taskCount > 0
                ? Math.round(
                    ((project.completedTaskCount || 0) / project.taskCount) * 100
                  )
                : 0;

            return (
              <div
                key={project.id}
                className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors ${
                  selectedProjectId === project.id
                    ? "bg-secondary"
                    : "hover:bg-muted"
                }`}
                onClick={() => onProjectSelect(project)}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {project.name}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Acciones del proyecto"
                          title="Acciones del proyecto"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(project)}>
                          <Edit className="h-3 w-3 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Progress value={progress} className="h-1 flex-1" />
                    <span className="text-xs text-muted-foreground">
                      {project.completedTaskCount || 0}/{project.taskCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
