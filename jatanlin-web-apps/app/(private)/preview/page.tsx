"use client";

import React from "react";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import {
  Button,
  Input,
  Text,
  Label,
  Spinner,
  Badge,
} from "@/src/components/atoms";
import { SearchBox, Card, FormField, Dialog } from "@/src/components/molecules";
import { Form, DataTable } from "@/src/components/organisms";

export default function PreviewPage() {
  const [searchValue, setSearchValue] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const tableData = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Pengembang",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Desainer",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "Manajer",
    },
  ];

  const tableColumns = [
    { key: "id", header: "ID", width: "80px" },
    { key: "name", header: "Nama" },
    { key: "email", header: "Email" },
    { key: "role", header: "Peran" },
  ];

  return (
    <FluentProvider theme={webLightTheme}>
      <div className="min-h-screen bg-[#fafafa]">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Atoms Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-[#323130]">
              Atom
            </h2>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mb-6">
              {/* Custom Color Buttons */}
              <div className="p-4 bg-white rounded-lg border border-[#e0e0e0]">
                <div className="text-base font-semibold mb-3 text-[#605e5c]">
                  Tombol Warna Kustom
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="primary" label="Utama" />
                  <Button variant="secondary" label="Sekunder" />
                  <Button variant="success" label="Sukses" />
                  <Button variant="warning" label="Peringatan" />
                  <Button variant="disable" label="Nonaktif" />
                </div>
              </div>

              {/* Fluent UI Buttons */}
              <div className="p-4 bg-white rounded-lg border border-[#e0e0e0]">
                <div className="text-base font-semibold mb-3 text-[#605e5c]">
                  Tombol Fluent UI
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button appearance="primary" label="Utama" />
                  <Button appearance="secondary" label="Sekunder" />
                  <Button appearance="outline" label="Garis Tepi" />
                  <Button appearance="subtle" label="Samar" />
                </div>
              </div>

              {/* Button Sizes */}
              <div className="p-4 bg-white rounded-lg border border-[#e0e0e0]">
                <div className="text-base font-semibold mb-3 text-[#605e5c]">
                  Ukuran Tombol
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="primary" size="small" label="Kecil" />
                  <Button variant="primary" size="medium" label="Sedang" />
                  <Button variant="primary" size="large" label="Besar" />
                </div>
              </div>

              {/* Badges */}
              <div className="p-4 bg-white rounded-lg border border-[#e0e0e0]">
                <div className="text-base font-semibold mb-3 text-[#605e5c]">
                  Lencana
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  <Badge variant="primary">Utama</Badge>
                  <Badge variant="secondary">Sekunder</Badge>
                  <Badge variant="success">Sukses</Badge>
                  <Badge variant="warning">Peringatan</Badge>
                  <Badge variant="disable">Nonaktif</Badge>
                </div>
              </div>

              {/* Inputs */}
              <div className="p-4 bg-white rounded-lg border border-[#e0e0e0]">
                <div className="text-base font-semibold mb-3 text-[#605e5c]">
                  Input
                </div>
                <div className="flex flex-col gap-3">
                  <Input placeholder="Input bawaan" />
                  <Input
                    appearance="filled-darker"
                    placeholder="Isi lebih gelap"
                  />
                  <Input
                    appearance="filled-lighter"
                    placeholder="Isi lebih terang"
                  />
                  <Input disabled placeholder="Input nonaktif" />
                </div>
              </div>

              {/* Text */}
              <div className="p-4 bg-white rounded-lg border border-[#e0e0e0]">
                <div className="text-base font-semibold mb-3 text-[#605e5c]">
                  Teks
                </div>
                <div className="flex flex-col gap-3">
                  <Text size={300}>Ukuran teks 300</Text>
                  <Text size={400}>Ukuran teks 400</Text>
                  <Text size={500} weight="semibold">
                    Ukuran teks 500 semi tebal
                  </Text>
                  <Text size={600} weight="bold">
                    Ukuran teks 600 tebal
                  </Text>
                </div>
              </div>

              {/* Labels */}
              <div className="p-4 bg-white rounded-lg border border-[#e0e0e0]">
                <div className="text-base font-semibold mb-3 text-[#605e5c]">
                  Label
                </div>
                <div className="flex flex-col gap-3">
                  <Label>Label Bawaan</Label>
                  <Label required>Label Wajib</Label>
                  <Label disabled>Label Nonaktif</Label>
                  <Label size="large">Label Besar</Label>
                </div>
              </div>

              {/* Spinner */}
              <div className="p-4 bg-white rounded-lg border border-[#e0e0e0]">
                <div className="text-base font-semibold mb-3 text-[#605e5c]">
                  Indikator Muat
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Spinner size="tiny" />
                  <Spinner size="extra-small" />
                  <Spinner size="small" />
                  <Spinner size="medium" message="Memuat..." />
                </div>
              </div>
            </div>
          </section>

          {/* Molecules Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-[#323130]">
              Molekul
            </h2>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mb-6">
              {/* SearchBox */}
              <div className="p-4 bg-white rounded-lg border border-[#e0e0e0]">
                <div className="text-base font-semibold mb-3 text-[#605e5c]">
                  Kotak Pencarian
                </div>
                <SearchBox
                  placeholder="Cari..."
                  value={searchValue}
                  onSearch={(value) => setSearchValue(value)}
                />
                {searchValue && <Text>Mencari: {searchValue}</Text>}
              </div>

              {/* FormField */}
              <div className="p-4 bg-white rounded-lg border border-[#e0e0e0]">
                <div className="text-base font-semibold mb-3 text-[#605e5c]">
                  Bidang Formulir
                </div>
                <div className="flex flex-col gap-3">
                  <FormField label="Nama Pengguna" required>
                    <Input placeholder="Masukkan nama pengguna" />
                  </FormField>
                  <FormField
                    label="Kata Sandi"
                    validationMessage="Kata sandi minimal 8 karakter"
                    validationState="warning"
                  >
                    <Input type="password" placeholder="Masukkan kata sandi" />
                  </FormField>
                </div>
              </div>

              {/* Dialog */}
              <div className="p-4 bg-white rounded-lg border border-[#e0e0e0]">
                <div className="text-base font-semibold mb-3 text-[#605e5c]">
                  Dialog
                </div>
                <Dialog
                  open={dialogOpen}
                  onOpenChange={(e, data) => setDialogOpen(data.open)}
                  trigger={<Button>Buka Dialog</Button>}
                  title="Dialog Contoh"
                  content="Ini adalah contoh konten dialog. Anda dapat menempatkan konten apa pun di sini."
                  actions={
                    <>
                      <Button
                        appearance="secondary"
                        onClick={() => setDialogOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button
                        appearance="primary"
                        onClick={() => setDialogOpen(false)}
                      >
                        Konfirmasi
                      </Button>
                    </>
                  }
                />
              </div>
            </div>

            {/* Cards */}
            <div className="mb-12">
              <div className="text-base font-semibold mb-3 text-[#605e5c]">
                Kartu
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mb-6">
                <Card title="Judul Kartu 1">
                  <div className="p-4">
                    <Text>Ini adalah kartu sederhana dengan judul dan konten.</Text>
                  </div>
                </Card>
                <Card title="Judul Kartu 2">
                  <div className="p-4">
                    <Text>Kartu lain dengan konten berbeda.</Text>
                    <Button appearance="primary" style={{ marginTop: "12px" }}>
                      Aksi
                    </Button>
                  </div>
                </Card>
                <Card>
                  <div className="p-4">
                    <Text weight="semibold">Kartu tanpa judul</Text>
                    <Text>Kartu ini tidak memiliki judul, hanya konten.</Text>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* Organisms Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-[#323130]">
              Organisme
            </h2>

            {/* Form */}
            <div className="p-4 bg-white rounded-lg border border-[#e0e0e0] mb-6">
              <div className="text-base font-semibold mb-3 text-[#605e5c]">
                Formulir
              </div>
              <Form
                onSubmit={(data) => {
                  console.log("Formulir dikirim:", data);
                  alert("Formulir berhasil dikirim! Periksa konsol untuk data.");
                }}
                onCancel={() => console.log("Formulir dibatalkan")}
              />
            </div>

            {/* DataTable */}
            <div className="p-4 bg-white rounded-lg border border-[#e0e0e0]">
              <div className="text-base font-semibold mb-3 text-[#605e5c]">
                Tabel Data
              </div>
              <DataTable columns={tableColumns} data={tableData} />
            </div>
          </section>
        </div>
      </div>
    </FluentProvider>
  );
}
