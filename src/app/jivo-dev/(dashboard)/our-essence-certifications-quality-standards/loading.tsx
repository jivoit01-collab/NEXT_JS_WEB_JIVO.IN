import { Loader } from 'lucide-react';

export default function CertificationsAdminLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
