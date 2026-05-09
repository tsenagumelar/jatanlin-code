"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { Button, Input, Text, Spinner } from "@/src/components/atoms";
import { FormField } from "@/src/components/molecules";
import { useLogin } from "./hooks";

export default function LoginModule() {
  const [activeModal, setActiveModal] = useState<"terms" | "privacy" | null>(
    null,
  );
  const { formData, isLoading, error, handleChange, handleSubmit } = useLogin();

  return (
    <FluentProvider theme={webLightTheme}>
      <div className="min-h-screen flex">
        {/* Left Column - Branding & Background */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-[url('/bg.jpeg')] bg-cover bg-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/35" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
            {/* Logo & Title */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <Image
                    src="/polantas.png"
                    alt="Logo Polantas"
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    KORLANTAS POLRI
                  </h1>
                  <p className="text-xl text-neutral-100 font-bold">
                    Direktorat Penegakan Hukum - Subdit Laka
                  </p>
                </div>
              </div>
            </div>

            {/* Slogan */}
            <div className="mb-16">
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                JATANLIN
                <br />
              </h2>
              <p className="text-lg text-blue-100 max-w-xl font-semibold">
                Platform untuk penegakan hukum kejahatan lalu lintas over
                dimensions over loading yang cepat, akurat dan transparan.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center bg-white p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#0078D4] rounded-lg flex items-center justify-center">
                <Image
                  src="/polantas.png"
                  alt="Logo Polantas"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#323130]">
                  KORLANTAS POLRI
                </h1>
                <p className="text-xl text-[#605E5C] font-bold">
                  Direktorat Penegakan Hukum - Subdit Laka
                </p>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-[#323130] mb-2">
                Selamat Datang Kembali
              </h2>
              <Text size={400} className="text-[#605E5C]">
                Masuk untuk melanjutkan ke akun Anda
              </Text>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField label="Alamat Email" required>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  placeholder="anda@example.com"
                  required
                  disabled={isLoading}
                  fullWidth
                />
              </FormField>

              <FormField label="Kata Sandi" required>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  placeholder="Masukkan kata sandi Anda"
                  required
                  disabled={isLoading}
                  fullWidth
                />
              </FormField>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#8A8886] text-[#0078D4] focus:ring-[#0078D4]"
                  />
                  <Text size={300} className="text-[#605E5C]">
                    Ingat saya
                  </Text>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-[#FEF6F6] border-l-4 border-warning rounded-r">
                  <Text size={300} style={{ color: "#A4262C" }}>
                    {error}
                  </Text>
                </div>
              )}

              {/* Submit Button */}
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="small" />
                    <span>Masuk...</span>
                  </div>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>

            {/* Terms & Privacy */}
            <div className="mt-8 text-center">
              <Text size={300} className="text-[#605E5C]">
                Dengan masuk, anda menyetujui{" "}
                <button
                  type="button"
                  onClick={() => setActiveModal("terms")}
                  className="text-[#0078D4] hover:underline font-semibold"
                >
                  Syarat & Ketentuan
                </button>{" "}
                dan{" "}
                <button
                  type="button"
                  onClick={() => setActiveModal("privacy")}
                  className="text-[#0078D4] hover:underline font-semibold"
                >
                  Kebijakan Privasi
                </button>
                .
              </Text>
            </div>
          </div>
        </div>
      </div>
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute right-3 top-3 text-[#605E5C] hover:text-[#323130]"
              aria-label="Tutup"
            >
              ✕
            </button>
            <div className="min-h-[120px]"></div>
          </div>
        </div>
      )}
    </FluentProvider>
  );
}
