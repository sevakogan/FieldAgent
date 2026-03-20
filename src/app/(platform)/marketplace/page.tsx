"use client";

import { useState, useMemo } from "react";

interface ProListing {
  readonly id: string;
  readonly companyName: string;
  readonly ownerName: string;
  readonly businessType: string;
  readonly city: string;
  readonly state: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly services: readonly string[];
  readonly startingPrice: number;
  readonly verified: boolean;
  readonly avatarColor: string;
}

const MOCK_PROS: readonly ProListing[] = [
  {
    id: "1",
    companyName: "Sparkle Clean Co.",
    ownerName: "Maria G.",
    businessType: "cleaning",
    city: "Miami",
    state: "FL",
    rating: 4.9,
    reviewCount: 127,
    services: ["Standard Cleaning", "Deep Cleaning", "Move-In/Out"],
    startingPrice: 120,
    verified: true,
    avatarColor: "#0071e3",
  },
  {
    id: "2",
    companyName: "Green Thumb Landscaping",
    ownerName: "Carlos R.",
    businessType: "lawn_care",
    city: "Miami",
    state: "FL",
    rating: 4.8,
    reviewCount: 89,
    services: ["Lawn Mowing", "Hedge Trimming", "Garden Maintenance"],
    startingPrice: 75,
    verified: true,
    avatarColor: "#34c759",
  },
  {
    id: "3",
    companyName: "Crystal Pool Services",
    ownerName: "David L.",
    businessType: "pool_care",
    city: "Fort Lauderdale",
    state: "FL",
    rating: 4.7,
    reviewCount: 54,
    services: ["Weekly Pool Cleaning", "Chemical Balancing", "Equipment Repair"],
    startingPrice: 90,
    verified: false,
    avatarColor: "#5856d6",
  },
  {
    id: "4",
    companyName: "SafeGuard Pest Control",
    ownerName: "James W.",
    businessType: "pest_control",
    city: "Orlando",
    state: "FL",
    rating: 4.9,
    reviewCount: 203,
    services: ["General Pest Control", "Termite Treatment", "Mosquito Spraying"],
    startingPrice: 99,
    verified: true,
    avatarColor: "#ff9500",
  },
  {
    id: "5",
    companyName: "Premier Pressure Wash",
    ownerName: "Sarah T.",
    businessType: "pressure_washing",
    city: "Tampa",
    state: "FL",
    rating: 4.6,
    reviewCount: 41,
    services: ["Driveway Cleaning", "House Wash", "Deck Restoration"],
    startingPrice: 150,
    verified: true,
    avatarColor: "#ff3b30",
  },
  {
    id: "6",
    companyName: "STR Turnovers Plus",
    ownerName: "Alex M.",
    businessType: "cleaning",
    city: "Miami Beach",
    state: "FL",
    rating: 5.0,
    reviewCount: 67,
    services: ["Airbnb Turnover", "Linen Service", "Restocking"],
    startingPrice: 100,
    verified: true,
    avatarColor: "#af52de",
  },
];

const BUSINESS_TYPES = [
  { value: "", label: "All Services" },
  { value: "cleaning", label: "Cleaning" },
  { value: "lawn_care", label: "Lawn Care" },
  { value: "pool_care", label: "Pool Care" },
  { value: "pest_control", label: "Pest Control" },
  { value: "pressure_washing", label: "Pressure Washing" },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "price" | "reviews">("rating");

  const filteredPros = useMemo(() => {
    const lower = search.toLowerCase();
    const filtered = MOCK_PROS.filter((pro) => {
      const matchesSearch = !search
        || pro.companyName.toLowerCase().includes(lower)
        || pro.city.toLowerCase().includes(lower)
        || pro.services.some((s) => s.toLowerCase().includes(lower));
      const matchesType = !selectedType || pro.businessType === selectedType;
      return matchesSearch && matchesType;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "price":
          return a.startingPrice - b.startingPrice;
        case "reviews":
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });
  }, [search, selectedType, sortBy]);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-[#1d1d1f] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Find a Pro</h1>
          <p className="text-white/60 mb-8">Browse trusted service professionals in your area</p>
          <div className="relative max-w-xl mx-auto">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868b]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, city, or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#0071e3] text-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {BUSINESS_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedType === type.value
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-white text-[#1d1d1f] hover:bg-[#e5e5e7]"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 rounded-full bg-white text-sm text-[#1d1d1f] border-none focus:ring-2 focus:ring-[#0071e3] cursor-pointer"
            >
              <option value="rating">Highest Rated</option>
              <option value="price">Lowest Price</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <p className="text-[#86868b] text-sm mb-4">
          {filteredPros.length} professional{filteredPros.length !== 1 ? "s" : ""} found
        </p>

        <div className="space-y-4">
          {filteredPros.map((pro) => (
            <div key={pro.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {/* Avatar */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ backgroundColor: pro.avatarColor }}
                >
                  {pro.companyName[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#1d1d1f]">{pro.companyName}</h3>
                        {pro.verified && (
                          <svg className="w-4 h-4 text-[#0071e3]" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-[#86868b]">
                        {pro.city}, {pro.state} &middot; {pro.ownerName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-bold text-[#1d1d1f]">{pro.rating}</span>
                        <span className="text-xs text-[#86868b]">({pro.reviewCount})</span>
                      </div>
                      <p className="text-sm text-[#86868b] mt-1">from ${pro.startingPrice}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {pro.services.map((service) => (
                      <span
                        key={service}
                        className="text-xs bg-[#f5f5f7] text-[#424245] px-2.5 py-1 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4">
                    <button className="px-5 py-2 rounded-full bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ED] transition-colors">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPros.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#86868b] text-lg">No professionals found</p>
            <p className="text-[#86868b] text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
