"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEngineer, useUpdateEngineer } from "@/lib/hooks/use-engineers";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function EditEngineerPage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const { data: engineer, isLoading } = useEngineer(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Engineer" />
        <Card className="max-w-lg">
          <CardContent className="pt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!engineer) {
    return <p className="text-muted-foreground">Engineer not found.</p>;
  }

  return (
    <EditEngineerForm
      engineer={engineer}
      id={id}
      onCancel={() => router.push("/admin/engineers")}
      onSuccess={() => router.push("/admin/engineers")}
    />
  );
}

function EditEngineerForm({
  engineer,
  id,
  onCancel,
  onSuccess,
}: {
  engineer: NonNullable<ReturnType<typeof useEngineer>["data"]>;
  id: number;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const updateMutation = useUpdateEngineer();
  const [form, setForm] = useState({
    name: engineer.name,
    email: engineer.email,
    employeeId: engineer.employeeId ?? "",
    password: "",
    phone: engineer.phone,
    specialization: engineer.specialization,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form };
    if (!data.password) delete (data as Record<string, unknown>).password;
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success("Engineer updated successfully");
          onSuccess();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Engineer"
        description={`Editing ${engineer.name}`}
      />
      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                value={form.employeeId}
                onChange={(e) =>
                  setForm({ ...form, employeeId: e.target.value })
                }
                placeholder="e.g., EMP-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Leave blank to keep existing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={form.specialization}
                onChange={(e) =>
                  setForm({ ...form, specialization: e.target.value })
                }
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
