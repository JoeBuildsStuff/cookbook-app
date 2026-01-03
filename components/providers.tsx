import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { NuqsAdapter } from 'nuqs/adapters/next/app'


export function Providers({ children }: { children: ReactNode }) {

  return (
      <NuqsAdapter>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
            <SidebarProvider>
              {children}
              <Toaster />
            </SidebarProvider>
        </ThemeProvider>
      </NuqsAdapter>
  )
}