"use client";
// src/components/templates/TemplateRenderer.tsx
import React from "react";
import type { Template, InvitationData } from "@/types";
import ElegantWeddingTemplate from "./ElegantWeddingTemplate";
import ModernEventTemplate from "./ModernEventTemplate";
import PlayfulBirthdayTemplate from "./PlayfulBirthdayTemplate";
import DefaultTemplate from "./DefaultTemplate";

export interface TemplateProps {
  template: Template;
  data: InvitationData;
  isView?: boolean;
  onUpdate?: (field: string, value: string) => void;
}

export default function TemplateRenderer({ template, data, isView = false, onUpdate }: TemplateProps) {
  const category = template.category;

  if (["WEDDING", "ENGAGEMENT", "ANNIVERSARY"].includes(category)) {
    return <ElegantWeddingTemplate template={template} data={data} isView={isView} onUpdate={onUpdate} />;
  }

  if (["MEETING", "CORPORATE", "CONFERENCE", "BUSINESS"].includes(category)) {
    return <ModernEventTemplate template={template} data={data} isView={isView} onUpdate={onUpdate} />;
  }

  if (["BIRTHDAY", "BABY_SHOWER"].includes(category)) {
    return <PlayfulBirthdayTemplate template={template} data={data} isView={isView} onUpdate={onUpdate} />;
  }

  return <DefaultTemplate template={template} data={data} isView={isView} onUpdate={onUpdate} />;
}
