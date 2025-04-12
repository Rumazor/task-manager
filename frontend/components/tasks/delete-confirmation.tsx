import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import type { Task } from "@/lib/types";
  
  type DeleteConfirmationProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskToDelete: Task | null;
    isDeleting: boolean;
    confirmDelete: () => Promise<void>;
  };
  
  export default function DeleteConfirmation({
    open,
    onOpenChange,
    taskToDelete,
    isDeleting,
    confirmDelete,
  }: DeleteConfirmationProps) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la tarea "
              {taskToDelete?.title}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Borrando..." : "Borrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }