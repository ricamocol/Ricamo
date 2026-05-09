import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountSidebar from "@/components/cuenta/AccountSidebar";

export default async function CuentaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=/cuenta");

  const { data: customer } = await supabase
    .from("customers")
    .select("full_name")
    .eq("auth_user_id", user.id)
    .single();

  const displayName = customer?.full_name ?? user.email ?? "Mi cuenta";

  return (
    <div className="min-h-screen bg-[#F3EDE0]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6">
          <p className="text-[10px] tracking-[0.28em] uppercase text-[#B5888A] font-[500]">
            Mi cuenta
          </p>
          <h1
            className="text-2xl text-[#3D2B1F] mt-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {displayName}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <AccountSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
