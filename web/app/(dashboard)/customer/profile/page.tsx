"use client";

import { useProfile } from "@/lib/hooks/use-profile";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, User, Mail, Phone, MapPin } from "lucide-react";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}

export default function CustomerProfilePage() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return <p className="text-muted-foreground">Could not load profile.</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Profile"
        description="Your company information on file."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              icon={Building2}
              label="Company Name"
              value={profile.companyName}
            />
            <InfoRow
              icon={User}
              label="Contact Person"
              value={profile.contactPersonName}
            />
            <InfoRow icon={Mail} label="Email" value={profile.email} />
            <InfoRow icon={Phone} label="Phone" value={profile.phone} />
            {profile.managerName && (
              <>
                <Separator />
                <InfoRow
                  icon={User}
                  label="Account Manager"
                  value={profile.managerName}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={MapPin} label="Address" value={profile.address} />
            <InfoRow icon={MapPin} label="City" value={profile.city} />
            <InfoRow icon={MapPin} label="State" value={profile.state} />
            <InfoRow icon={MapPin} label="Pincode" value={profile.pincode} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
