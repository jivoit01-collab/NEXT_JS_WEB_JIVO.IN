import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import localFont from 'next/font/local'
import { Toaster } from 'sonner';
import { AuthSessionProvider, ThemeProvider, QueryProvider } from '@/providers';
import { ReduxProvider } from '@/store/provider';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

// Jost — primary brand font (loaded from /public/fonts)
const jost = localFont({
  src: [
    { path: '../../public/fonts/Jost-Light.ttf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/Jost-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Jost-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../public/fonts/Jost-MediumItalic.ttf', weight: '500', style: 'italic' },
    { path: '../../public/fonts/Jost-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../../public/fonts/Jost-BoldItalic.ttf', weight: '700', style: 'italic' },
    { path: '../../public/fonts/Jost-ExtraBold.ttf', weight: '800', style: 'normal' },
  ],
  variable: '--font-jost',
  display: 'swap',
})



export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Premium Oils, Superfoods & Wellness Products`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: SITE_NAME,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${playfair.variable} ${jost.variable} font-sans antialiased`}
      >
        <AuthSessionProvider>
          <ThemeProvider>
            <ReduxProvider>
              <QueryProvider>
                {children}
                <Toaster richColors position="top-right" />
              </QueryProvider>
            </ReduxProvider>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
