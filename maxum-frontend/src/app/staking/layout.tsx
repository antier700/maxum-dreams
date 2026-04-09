import Header from "@/components/common/header/Header";
import "@/app/(private)/layout.scss";

export default function StakingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pageWrapper">
      <Header />
      <main className="mainContent">{children}</main>
    </div>
  );
}
