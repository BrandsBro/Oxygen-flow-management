import DeleteModal from "@/components/ui/DeleteModal";

export default function DeleteConfirmModal({ open, onCancel, onConfirm, deleting }) {
  return (
    <DeleteModal
      open={open}
      onCancel={onCancel}
      onConfirm={onConfirm}
      deleting={deleting}
      title="Delete Ticket?"
      message="This ticket will be permanently deleted. This action cannot be undone."
    />
  );
}
