
'use client';
import { FileText, LogOut, User, Scale, LayoutDashboard, Settings, Upload, Home } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/images/logo.png';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { LanguageSwitcher } from './language-switcher';

const Header = () => {
  const { user, userRole, signOut, loading } = useAuth();
  const pathname = usePathname();

  const getInitials = (email?: string | null) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  const getRoleColor = () => {
    if (userRole === 'admin') return 'ring-2 ring-green-500';
    if (userRole === 'lawyer') return 'ring-2 ring-purple-500';
    return 'ring-2 ring-blue-500';
  };

  return (
    <header className="border-b bg-card shrink-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={logo}
                alt="ClarityDocs"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <h1 className="text-xl font-bold tracking-tight text-foreground">ClarityDocs</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {user && (
              <nav className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </Button>
                {userRole !== 'admin' && userRole !== 'lawyer' && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/consultation">
                      <Scale className="mr-2 h-4 w-4" />
                      Consultation
                    </Link>
                  </Button>
                )}
                {userRole && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={userRole === 'lawyer' ? '/dashboard/lawyer' : userRole === 'admin' ? '/dashboard/admin' : '/clarity'}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                )}
              </nav>
            )}
            {!loading &&
              (user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                       <Avatar className={`h-9 w-9 ${getRoleColor()}`}>
                        <AvatarImage src={user.photoURL || ''} alt={user.email || ''} />
                        <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">My Account</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="md:hidden">
                      <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Home
                      </Link>
                    </DropdownMenuItem>
                    {userRole !== 'admin' && userRole !== 'lawyer' && (
                      <DropdownMenuItem asChild className="md:hidden">
                        <Link href="/consultation">
                          <Scale className="mr-2 h-4 w-4" />
                          Consultation
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {userRole && (
                      <DropdownMenuItem asChild className="md:hidden">
                        <Link href={userRole === 'lawyer' ? '/dashboard/lawyer' : userRole === 'admin' ? '/dashboard/admin' : '/clarity'}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="md:hidden" />
                    {userRole === 'lawyer' && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/lawyer/profile">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
