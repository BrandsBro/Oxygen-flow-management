"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTicketById, updateTicket, deleteTicket } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import TicketHeader from "@/components/ticket/TicketHeader";
import TicketCustomerInfo from "@/components/ticket/TicketCustomerInfo";
import TicketDescription from "@/components/ticket/TicketDescription";
import TicketNotes from "@/components/ticket/TicketNotes";
import TicketProofLink from "@/components/ticket/TicketProofLink";
import TicketSidebar from "@/components/ticket/TicketSidebar";
import DeleteConfirmModal from "@/components/ticket/DeleteConfirmModal";

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    getTicketById(id).then((res) => {
      if (res.success) {
        setTicket(res.data);
        setForm({
          title:         res.data["Title"] || "",
          customerName:  res.data["Customer Name"] || "",
          orderNumber:   res.data["Order Number"] || "",
          issueType:     res.data["Issue Type"] || "General Support",
          priority:      res.data["Priority"] || "Medium",
          status:        res.data["Status"] || "New",
          channel:       res.data["Channel"] || "",
          assignedTo:    res.data["Assigned To"] || "",
          dueDate:       res.data["Due Date"] || "",
          description:   res.data["Description"] || "",
          internalNotes: res.data["Internal Notes"] || "",
          proofLink:     res.data["Proof / Reference Link"] || "",
        });
      }
      setLoading(false);
    });
  }, [id]);

  const onChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await updateTicket({ id, ...form, updatedBy: user?.fullName });
      if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
      else setError("Failed to save.");
    } catch { setError("Something went wrong."); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteTicket(id);
    if (res.success) router.push("/dashboard/tasks");
    else { setError("Failed to delete."); setDeleting(false); }
  };

  if (loading) return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-6 w-48 bg-gray-200 rounded" />
      <div className="h-96 bg-white rounded-xl shadow-sm" />
    </div>
  );

  if (!ticket) return (
    <div className="p-6 text-center text-gray-400">
      Ticket not found.
      <button onClick={() => router.back()} className="ml-2 text-blue-500 underline">Go back</button>
    </div>
  );

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <TicketHeader
        id={id}
        form={form}
        ticket={ticket}
        saving={saving}
        saved={saved}
        error={error}
        onSave={handleSave}
        onDeleteClick={() => setShowDelete(true)}
        onChange={onChange}
      />

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">
          <TicketCustomerInfo form={form} onChange={onChange} />
          <TicketDescription  form={form} onChange={onChange} />
          <TicketNotes        form={form} onChange={onChange} />
          <TicketProofLink    form={form} onChange={onChange} />
        </div>
        <div>
          <TicketSidebar form={form} onChange={onChange} />
        </div>
      </div>

      <DeleteConfirmModal
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
