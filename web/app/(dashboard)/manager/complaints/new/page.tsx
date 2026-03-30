"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateManagerComplaint } from "@/lib/hooks/use-complaints";
import { useCustomers } from "@/lib/hooks/use-customers";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { ManagerComplaintRequest } from "@/lib/types";
import {
  COMPLAINT_SYSTEM_OPTIONS,
  getComplaintIssues,
} from "@/lib/complaint-options";

export default function ManagerNewComplaintPage() {
  const router = useRouter();
  const { data: customers, isLoading: loadingCustomers } =
    useCustomers("/manager");
  const createMutation = useCreateManagerComplaint();

  const [form, setForm] = useState<ManagerComplaintRequest>({
    customerId: 0,
    title: "",
    description: "",
    category: "",
    equipmentName: "",
    siteAddress: "",
  });

  function update<K extends keyof ManagerComplaintRequest>(
    field: K,
    value: ManagerComplaintRequest[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateSystem(system: string) {
    const nextIssues = getComplaintIssues(system);

    setForm((prev) => ({
      ...prev,
      category: system,
      title: nextIssues.includes(prev.title)
        ? prev.title
        : nextIssues.length === 1
          ? nextIssues[0]
          : "",
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!form.category) {
      toast.error("Please select a system");
      return;
    }
    if (!form.title) {
      toast.error("Please select an issue");
      return;
    }
    const data: ManagerComplaintRequest = {
      customerId: form.customerId,
      title: form.title,
      description: form.description,
      category: form.category || undefined,
      equipmentName: form.equipmentName || undefined,
      siteAddress: form.siteAddress || undefined,
    };
    createMutation.mutate(data, {
      onSuccess: (complaint) => {
        toast.success("Complaint created successfully");
        router.push(`/manager/complaints/${complaint.id}`);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  const issueOptions = getComplaintIssues(form.category);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Complaint"
        description="Create a complaint on behalf of a customer"
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select
                value={form.customerId ? String(form.customerId) : ""}
                onValueChange={(v) => update("customerId", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingCustomers
                        ? "Loading customers..."
                        : "Select a customer"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.companyName} — {c.contactPersonName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Select System *</Label>
                <Select value={form.category} onValueChange={updateSystem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select system" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_SYSTEM_OPTIONS.map((system) => (
                      <SelectItem key={system} value={system}>
                        {system}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Issue *</Label>
                <Select
                  value={form.title}
                  onValueChange={(value) => update("title", value)}
                  disabled={!form.category}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        form.category ? "Select issue" : "Select system first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {issueOptions.map((issue) => (
                      <SelectItem key={issue} value={issue}>
                        {issue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detail of Issue *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe the issue in detail..."
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipmentName">Equipment Name</Label>
              <Input
                id="equipmentName"
                value={form.equipmentName}
                onChange={(e) => update("equipmentName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteAddress">Site Address</Label>
              <Input
                id="siteAddress"
                value={form.siteAddress}
                onChange={(e) => update("siteAddress", e.target.value)}
                placeholder="Where the issue is located"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Complaint"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/manager/complaints")}
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
