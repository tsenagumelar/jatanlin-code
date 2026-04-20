'use client';

import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { Navbar, Sidebar } from '@/src/components/organisms';
import { SidebarProvider } from '@/src/contexts/SidebarContext';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FluentProvider theme={webLightTheme}>
      <SidebarProvider>
        <div className="h-screen flex flex-col bg-[#F3F2F1]">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-hidden bg-[#F3F2F1] flex flex-col">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </FluentProvider>
  );
}
