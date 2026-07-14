"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownload24Regular,
  Book24Regular,
  Chat24Regular,
  Dismiss24Regular,
  Play24Filled,
  QuestionCircle24Regular,
  Video24Regular,
} from "@fluentui/react-icons";
import { useGetConfigsQuery } from "@/src/graphql/hooks/configuration";
import { V3DefaultPage } from "@/src/modules/v3/shared/DefaultPage";

const manualTopics = [
  {
    title: "System Introduction",
    description: "Application overview and main feature map",
  },
  {
    title: "ODOL Inspection Process",
    description: "Step-by-step overweight vehicle detection workflow",
  },
  {
    title: "Verification and Reporting",
    description: "How to verify inspection data and prepare reports",
  },
  {
    title: "System Configuration",
    description: "Master data setup and device configuration",
  },
];

const videoTutorials = [
  {
    title: "Basic Tutorial",
    description: "Interface introduction and application navigation",
    duration: "5:30",
  },
  {
    title: "ODOL Inspection Process",
    description: "How to perform a vehicle inspection",
    duration: "8:15",
  },
  {
    title: "Data Verification",
    description: "Guide to reviewing and confirming inspection results",
    duration: "6:45",
  },
  {
    title: "Master Data Configuration",
    description: "Vehicle class and user management setup",
    duration: "7:20",
  },
];

const faqs = [
  {
    question: "How do I verify vehicle data?",
    answer: "Open the transaction detail, complete the actual vehicle data, then select Verify.",
  },
  {
    question: "Why is the status still Needs Review?",
    answer: "The data has not been verified yet, or the verification is still saved as a draft.",
  },
  {
    question: "How do I update vehicle class master data?",
    answer: "Go to Vehicle Classes under Master Data, then edit the required record.",
  },
  {
    question: "Why can I not upload additional evidence?",
    answer: "Make sure the selected image file is valid and does not exceed the upload limit.",
  },
];

function NumberedItem({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100">
        <span className="text-xs font-bold text-blue-700">{index}</span>
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function VideoItem({
  title,
  description,
  duration,
}: {
  title: string;
  description: string;
  duration: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-4 rounded-lg bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100">
        <Play24Filled className="h-5 w-5 text-violet-700" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <span className="shrink-0 text-sm font-semibold text-slate-400">{duration}</span>
    </button>
  );
}

export function V3GuidelineModule() {
  const [faqOpen, setFaqOpen] = useState(false);
  const { data: configData } = useGetConfigsQuery({
    variables: {
      limit: 1,
      offset: 0,
      where: { config_key: { _eq: "WHATSAPP" } },
    },
  });

  const whatsappLink = useMemo(() => {
    const number = configData?.master_config?.[0]?.config_value || "";
    return number ? `https://wa.me/${number}` : "";
  }, [configData]);

  return (
    <V3DefaultPage
      title="Guideline"
      breadcrumbs={[{ label: "System" }, { label: "Guideline" }]}
      description="Guides and tutorials for operating the JATANLIN application."
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid min-h-[420px] grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Book24Regular className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Manual Book</h2>
                  <p className="text-sm font-medium text-slate-500">Complete User Guide</p>
                </div>
              </div>

              <p className="mb-6 leading-7 text-slate-600">
                This manual book contains the complete guide for using JATANLIN,
                short for Jalan Tanpa Kelewatan Muatan. It covers available
                application features, from login, ODOL inspection, and vehicle
                review to verification and reporting.
              </p>

              <div className="mb-6 space-y-3">
                {manualTopics.map((topic, index) => (
                  <NumberedItem
                    key={topic.title}
                    index={index + 1}
                    title={topic.title}
                    description={topic.description}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800"
                >
                  <ArrowDownload24Regular className="h-5 w-5" />
                  Download PDF
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Read Online
                </button>
              </div>
            </div>

            <div className="relative flex min-h-[320px] items-center justify-center bg-blue-700 p-8">
              <div className="w-full max-w-md">
                <div className="rotate-2 rounded-lg bg-white p-6 shadow-2xl transition-transform duration-300 hover:rotate-0">
                  <div className="mb-4 h-8 w-3/4 rounded bg-slate-100" />
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-slate-200" />
                    <div className="h-3 w-5/6 rounded bg-slate-200" />
                    <div className="h-3 w-4/6 rounded bg-slate-200" />
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="h-20 rounded-lg bg-blue-100" />
                    <div className="h-20 rounded-lg bg-blue-100" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded bg-slate-200" />
                    <div className="h-3 w-3/4 rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid min-h-[420px] grid-cols-1 lg:grid-cols-2">
            <div className="relative flex min-h-[320px] items-center justify-center bg-slate-900 p-8">
              <div className="w-full max-w-md overflow-hidden rounded-xl bg-slate-800 shadow-2xl">
                <div className="relative flex aspect-video items-center justify-center bg-slate-700">
                  <button
                    type="button"
                    className="group flex h-20 w-20 items-center justify-center rounded-full bg-white/95 shadow-lg transition-all hover:scale-105 hover:bg-white"
                    aria-label="Play video tutorial"
                  >
                    <Play24Filled className="ml-1 h-8 w-8 text-slate-800 group-hover:text-blue-700" />
                  </button>
                  <div className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                    12:45
                  </div>
                </div>
                <div className="bg-slate-800 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-600" />
                    <div className="flex-1">
                      <div className="h-1 rounded-full bg-slate-600">
                        <div className="h-1 w-1/3 rounded-full bg-blue-500" />
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100">
                  <Video24Regular className="h-6 w-6 text-violet-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Video Tutorial</h2>
                  <p className="text-sm font-medium text-slate-500">Step-by-Step Visual Guide</p>
                </div>
              </div>

              <p className="mb-6 leading-7 text-slate-600">
                These video tutorials help operators understand how to use
                JATANLIN more easily. Follow each walkthrough to learn the main
                application workflows and supporting features.
              </p>

              <div className="mb-6 space-y-4">
                {videoTutorials.map((video) => (
                  <VideoItem
                    key={video.title}
                    title={video.title}
                    description={video.description}
                    duration={video.duration}
                  />
                ))}
              </div>

              <button
                type="button"
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-800"
              >
                <Play24Filled className="h-5 w-5" />
                Watch All Videos
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Need More Help?</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            If you have questions or need technical assistance, contact the
            support team or review the frequently asked questions.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (whatsappLink) window.open(whatsappLink, "_blank");
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <Chat24Regular className="h-5 w-5" />
              Contact Support
            </button>
            <button
              type="button"
              onClick={() => setFaqOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <QuestionCircle24Regular className="h-5 w-5" />
              FAQ
            </button>
          </div>
        </section>
      </div>

      {faqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-950">FAQ</h2>
              <button
                type="button"
                onClick={() => setFaqOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close FAQ"
              >
                <Dismiss24Regular />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <p className="font-semibold text-slate-900">{faq.question}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setFaqOpen(false)}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </V3DefaultPage>
  );
}
