'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Star,
  Image,
  Truck,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useStore } from '@/lib/store-context';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const sidebarNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/leads', label: 'Leads', icon: MessageSquare },
  { href: '/admin/delivery', label: 'Delivery', icon: Truck },
  { href: '/admin/content', label: 'Content', icon: Image },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, logout } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!state.user) {
      router.push('/login');
    } else if (state.user.role !== 'admin') {
      router.push('/');
    }
  }, [state.user, router]);

  if (!state.user || state.user.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You need admin privileges to access this page.</p>
          <Link href="/login">
            <Button className="mt-4">Login as Admin</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-serif text-xl font-bold text-primary">Kitchen Rahasya</span>
        </Link>
        <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Admin</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {sidebarNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User Info & Logout */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {state.user.name.charAt(0)}
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate">{state.user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{state.user.email}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Link href="/" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Store
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-background lg:block">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
              <Link href="/admin" className="hover:text-foreground">
                Admin
              </Link>
              {pathname !== '/admin' && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="capitalize text-foreground">
                    {pathname.split('/').pop()}
                  </span>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, {state.user.name}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
