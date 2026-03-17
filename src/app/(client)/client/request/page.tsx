"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface CompanyService {
  readonly id: string;
  readonly name: string;
  readonly default_price: number;
  readonly category: string;
}

const OTHER_OPTION: CompanyService = {
  id: "other",
  name: "Other",
  default_price: 0,
  category: "",
} as const;

function groupByCategory(
  services: readonly CompanyService[]
): ReadonlyMap<string, readonly CompanyService[]> {
  const groups = new Map<string, CompanyService[]>();
  for (const svc of services) {
    const key = svc.category || "General";
    const existing = groups.get(key) ?? [];
    groups.set(key, [...existing, svc]);
  }
  return groups;
}

function ServiceSkeleton() {
  return (
    <Card className="mb-4" padding="lg">
      <h3 className="font-bold text-xs text-gray-400 tracking-widest mb-3">SERVICE TYPE</h3>
      <div className="flex flex-col gap-2 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-full h-12 rounded-xl bg-gray-100" />
        ))}
      </div>
    </Card>
  );
}

function ServiceButton({
  service,
  isSelected,
  onSelect,
}: {
  readonly service: CompanyService;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
        isSelected
          ? "border-brand bg-brand/5 text-brand"
          : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
      }`}
    >
      {service.name}
      {service.default_price > 0 && (
        <span className="float-right text-gray-400 font-normal">
          ~${(service.default_price / 100).toFixed(0)}
        </span>
      )}
    </button>
  );
}

export default function RequestJobPage() {
  const router = useRouter();
  const [services, setServices] = useState<readonly CompanyService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [customService, setCustomService] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoadingServices(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", user.id)
          .single();

        if (!profile?.company_id) {
          setLoadingServices(false);
          return;
        }

        const { data: companyServices, error: fetchError } = await supabase
          .from("company_services")
          .select("id, name, default_price, category")
          .eq("company_id", profile.company_id)
          .eq("is_active", true)
          .order("sort_order");

        if (fetchError) {
          setError(fetchError.message);
          setLoadingServices(false);
          return;
        }

        setServices(companyServices ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load services"
        );
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  const allOptions = [...services, OTHER_OPTION] as const;
  const selectedService = allOptions.find((s) => s.id === selectedServiceId);
  const estimate = selectedService?.default_price ?? 0;
  const isOther = selectedServiceId === "other";

  const categories = groupByCategory(services);
  const hasMultipleCategories = categories.size > 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, company_id")
      .eq("id", user!.id)
      .single();

    if (!profile) {
      setError("Profile not found");
      setLoading(false);
      return;
    }

    const description = isOther
      ? customService
      : selectedService?.name ?? "";
    const { error: insertError } = await supabase
      .from("job_requests")
      .insert({
        company_id: profile.company_id,
        client_id: profile.id,
        service_description: description,
        estimated_amount: estimate,
      });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      router.push("/client");
      router.refresh();
    }, 2000);
  };

  if (success) {
    return (
      <div className="max-w-lg text-center py-16">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="font-extrabold text-xl mb-2">Request Sent!</h2>
        <p className="text-sm text-gray-400">
          Your service provider will review and respond soon.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h2 className="font-extrabold text-xl mb-1">Request a Job</h2>
      <p className="text-sm text-gray-400 mb-5">
        Pick a service and we&apos;ll send it to your provider
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {loadingServices ? (
          <ServiceSkeleton />
        ) : (
          <Card className="mb-4" padding="lg">
            <h3 className="font-bold text-xs text-gray-400 tracking-widest mb-3">
              SERVICE TYPE
            </h3>

            {services.length === 0 && (
              <p className="text-sm text-gray-400 mb-3">
                Your provider hasn&apos;t set up services yet.
              </p>
            )}

            <div className="flex flex-col gap-2">
              {hasMultipleCategories
                ? Array.from(categories.entries()).map(
                    ([category, categoryServices]) => (
                      <div key={category}>
                        <p className="text-[10px] font-semibold text-gray-400 tracking-widest mt-2 mb-1.5">
                          {category.toUpperCase()}
                        </p>
                        {categoryServices.map((s) => (
                          <ServiceButton
                            key={s.id}
                            service={s}
                            isSelected={selectedServiceId === s.id}
                            onSelect={() => setSelectedServiceId(s.id)}
                          />
                        ))}
                      </div>
                    )
                  )
                : services.map((s) => (
                    <ServiceButton
                      key={s.id}
                      service={s}
                      isSelected={selectedServiceId === s.id}
                      onSelect={() => setSelectedServiceId(s.id)}
                    />
                  ))}

              <ServiceButton
                service={OTHER_OPTION}
                isSelected={isOther}
                onSelect={() => setSelectedServiceId("other")}
              />
            </div>
          </Card>
        )}

        {isOther && (
          <Card className="mb-4" padding="lg">
            <label className="text-[10px] font-semibold text-gray-400 tracking-widest block mb-1.5">
              DESCRIBE THE SERVICE
            </label>
            <textarea
              value={customService}
              onChange={(e) => setCustomService(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-gray-400 transition-colors resize-none h-24"
              placeholder="What do you need done?"
              required
            />
          </Card>
        )}

        {estimate > 0 && (
          <Card className="mb-4 text-center" padding="lg">
            <p className="text-xs text-gray-400 mb-1">Estimated cost</p>
            <p className="font-black text-3xl tracking-tight">
              ${(estimate / 100).toFixed(0)}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Final price confirmed by provider
            </p>
          </Card>
        )}

        <button
          type="submit"
          disabled={
            loading ||
            loadingServices ||
            !selectedServiceId ||
            (isOther && !customService)
          }
          className="w-full bg-brand-dark text-white border-none rounded-xl py-3.5 font-bold text-[15px] cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50"
        >
          {loading ? "..." : "Send Request"}
        </button>
      </form>
    </div>
  );
}
