import './globals.css';
export const metadata = { title: 'Magnus Talent Intelligence Agent', description: 'Automated resume-to-recruiter pipeline' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
