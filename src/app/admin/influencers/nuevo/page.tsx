import { InfluencerForm } from "@/components/admin/InfluencerForm";

export default function NuevoInfluencerPage() {
  return (
    <div className="max-w-xl">
      <h1
        className="text-3xl text-[#3D2B1F] mb-6"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        Nuevo influencer
      </h1>
      <InfluencerForm />
    </div>
  );
}
