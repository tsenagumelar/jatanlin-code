import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/src/redux/providers";
import { FluentProviderWrapper } from "@/src/providers/FluentProvider";
import { ApolloProviderWrapper } from "@/src/providers/ApolloProvider";
import { ProcessingProvider } from "@/src/contexts/ProcessingContext";

export const metadata: Metadata = {
  title: "Jatanlin Web",
  description: "Fluent UI dengan Atomic Design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <ApolloProviderWrapper>
          <FluentProviderWrapper>
            <ReduxProvider>
              <ProcessingProvider>{children}</ProcessingProvider>
            </ReduxProvider>
          </FluentProviderWrapper>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
