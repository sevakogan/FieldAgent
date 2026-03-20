"use client";

import { useState } from "react";

// Mock data — will be replaced with API fetch by company slug
const MOCK_COMPANY = {
  name: "Sparkle Clean Co.",
  slug: "sparkle-clean",
  logo: null,
  brandColor: "#0071e3",
  services: [
    { id: "1", name: "Standard Cleaning", price: 150, duration: "2-3 hours" },
    { id: "2", name: "Deep Cleaning", price: 275, duration: "4-5 hours" },
    { id: "3", name: "Move-In/Out Cleaning", price: 350, duration: "5-6 hours" },
    { id: "4", name: "Post-Construction", price: 500, duration: "6-8 hours" },
  ],
  availability: [
    "2026-03-25",
    "2026-03-26",
    "2026-03-27",
    "2026-03-28",
    "2026-03-31",
    "2026-04-01",
    "2026-04-02",
  ],
  timeSlots: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"],
};

type BookingStep = "service" | "datetime" | "details" | "confirm";

export default function BookingPage() {
  const [step, setStep] = useState<BookingStep>("service");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const company = MOCK_COMPANY;
  const service = company.services.find((s) => s.id === selectedService);

  function handleFormChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    // TODO: POST to /api/bookings
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">Booking Requested!</h2>
          <p className="text-[#86868b] mb-6">
            {company.name} will confirm your {service?.name} shortly. Check your email for updates.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setStep("service");
              setSelectedService(null);
              setSelectedDate(null);
              setSelectedTime(null);
              setFormData({ name: "", email: "", phone: "", address: "", notes: "" });
            }}
            className="text-[#0071e3] font-medium hover:underline"
          >
            Book another service
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-[#1d1d1f] text-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-1">{company.name}</h1>
          <p className="text-white/60 text-sm">Book a service online</p>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-8">
          {(["service", "datetime", "details", "confirm"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s
                    ? "bg-[#0071e3] text-white"
                    : i < ["service", "datetime", "details", "confirm"].indexOf(step)
                      ? "bg-green-500 text-white"
                      : "bg-[#e5e5e7] text-[#86868b]"
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && <div className="flex-1 h-0.5 bg-[#e5e5e7]" />}
            </div>
          ))}
        </div>

        {/* Step 1: Service Selection */}
        {step === "service" && (
          <div>
            <h2 className="text-xl font-bold text-[#1d1d1f] mb-4">Choose a Service</h2>
            <div className="space-y-3">
              {company.services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => {
                    setSelectedService(svc.id);
                    setStep("datetime");
                  }}
                  className={`w-full bg-white rounded-xl p-4 text-left transition-all border-2 ${
                    selectedService === svc.id ? "border-[#0071e3]" : "border-transparent"
                  } hover:shadow-md`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-[#1d1d1f]">{svc.name}</h3>
                      <p className="text-sm text-[#86868b] mt-1">Est. {svc.duration}</p>
                    </div>
                    <span className="text-lg font-bold text-[#1d1d1f]">${svc.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === "datetime" && (
          <div>
            <h2 className="text-xl font-bold text-[#1d1d1f] mb-4">Pick a Date & Time</h2>
            <div className="bg-white rounded-xl p-4 mb-4">
              <h3 className="font-medium text-[#1d1d1f] mb-3">Available Dates</h3>
              <div className="grid grid-cols-3 gap-2">
                {company.availability.map((date) => {
                  const d = new Date(date + "T12:00:00");
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 rounded-lg text-center transition-colors ${
                        selectedDate === date
                          ? "bg-[#0071e3] text-white"
                          : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e5e5e7]"
                      }`}
                    >
                      <div className="text-xs font-medium">
                        {d.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className="text-lg font-bold">
                        {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="bg-white rounded-xl p-4 mb-4">
                <h3 className="font-medium text-[#1d1d1f] mb-3">Available Times</h3>
                <div className="grid grid-cols-3 gap-2">
                  {company.timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg text-center transition-colors ${
                        selectedTime === time
                          ? "bg-[#0071e3] text-white"
                          : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e5e5e7]"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("service")}
                className="px-6 py-3 rounded-full border border-[#e5e5e7] text-[#1d1d1f] font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep("details")}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 px-6 py-3 rounded-full bg-[#0071e3] text-white font-medium disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact Details */}
        {step === "details" && (
          <div>
            <h2 className="text-xl font-bold text-[#1d1d1f] mb-4">Your Details</h2>
            <div className="bg-white rounded-xl p-4 space-y-4">
              {[
                { label: "Full Name", field: "name", type: "text", required: true },
                { label: "Email", field: "email", type: "email", required: true },
                { label: "Phone", field: "phone", type: "tel", required: true },
                { label: "Service Address", field: "address", type: "text", required: true },
              ].map(({ label, field, type, required }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={type}
                    value={formData[field as keyof typeof formData]}
                    onChange={(e) => handleFormChange(field, e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[#e5e5e7] bg-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3] text-[#1d1d1f]"
                    required={required}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1">
                  Special Instructions
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-[#e5e5e7] bg-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3] text-[#1d1d1f] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep("datetime")}
                className="px-6 py-3 rounded-full border border-[#e5e5e7] text-[#1d1d1f] font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep("confirm")}
                disabled={!formData.name || !formData.email || !formData.phone || !formData.address}
                className="flex-1 px-6 py-3 rounded-full bg-[#0071e3] text-white font-medium disabled:opacity-40"
              >
                Review Booking
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === "confirm" && service && (
          <div>
            <h2 className="text-xl font-bold text-[#1d1d1f] mb-4">Confirm Your Booking</h2>
            <div className="bg-white rounded-xl p-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-[#86868b]">Service</span>
                <span className="font-semibold text-[#1d1d1f]">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Date</span>
                <span className="font-semibold text-[#1d1d1f]">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Time</span>
                <span className="font-semibold text-[#1d1d1f]">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868b]">Location</span>
                <span className="font-semibold text-[#1d1d1f] text-right max-w-[60%]">{formData.address}</span>
              </div>
              <div className="border-t border-[#e5e5e7] pt-4 flex justify-between">
                <span className="text-lg font-bold text-[#1d1d1f]">Total</span>
                <span className="text-lg font-bold text-[#1d1d1f]">${service.price}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep("details")}
                className="px-6 py-3 rounded-full border border-[#e5e5e7] text-[#1d1d1f] font-medium"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 rounded-full bg-[#0071e3] text-white font-medium"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-[#86868b] text-xs">
        Powered by KleanHQ
      </div>
    </div>
  );
}
