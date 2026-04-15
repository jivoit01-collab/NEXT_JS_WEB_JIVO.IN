import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui';

const certifications = ['FDA Approved', 'ISO Certified', 'Sedex Certified', 'FSSAI'];

interface CertificationBadgesProps {
  items?: string[];
}

export function CertificationBadges({ items = certifications }: CertificationBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((cert) => (
        <Badge key={cert} variant="secondary" className="gap-1">
          <Shield className="h-3 w-3" />
          {cert}
        </Badge>
      ))}
    </div>
  );
}
