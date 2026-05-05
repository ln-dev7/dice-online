// Root layout — délègue tout au layout localisé /app/[locale]/layout.tsx.
// Note : impossible de définir <html>/<body> ici car le segment [locale] doit
// pouvoir contrôler les attributs lang et dir (pour RTL).
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
