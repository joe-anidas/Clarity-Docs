
'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export default function GetStartedButton() {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <Skeleton className="h-11 w-[200px] rounded-md" />;
  }

  // Determine href based on user role
  let href = '/sign-up';
  let text = 'Get Started';

  if (user) {
    if (userRole === 'admin') {
      href = '/dashboard/admin';
      text = 'Go to Dashboard';
    } else if (userRole === 'lawyer') {
      href = '/dashboard/lawyer';
      text = 'Go to Dashboard';
    } else {
      href = '/clarity';
      text = 'Upload Document';
    }
  }

  return (
    <Button asChild size="lg">
      <Link href={href}>
        {text}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </Button>
  );
}
