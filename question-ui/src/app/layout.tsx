import "./globals.css";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import ClientLayout from "@/components/ClientLayout";
import { MathJaxContext } from "better-react-mathjax";

const mathJaxConfig = {
  loader: { load: ["input/mml", "output/chtml"] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MathJaxContext>
          <ReactQueryProvider>
            <AuthProvider>
              <ClientLayout>{children}</ClientLayout>
            </AuthProvider>
          </ReactQueryProvider>
        </MathJaxContext>
      </body>
    </html>
  );
}
