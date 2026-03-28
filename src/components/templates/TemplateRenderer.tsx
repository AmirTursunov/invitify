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
}

export default function TemplateRenderer({ template, data, isView = false }: TemplateProps) {
  const category = template.category;

  if (["WEDDING", "ENGAGEMENT", "ANNIVERSARY"].includes(category)) {
    return <ElegantWeddingTemplate template={template} data={data} isView={isView} />;
  }

  if (["MEETING", "CORPORATE", "CONFERENCE", "BUSINESS"].includes(category)) {
    return <ModernEventTemplate template={template} data={data} isView={isView} />;
  }

  if (["BIRTHDAY", "BABY_SHOWER"].includes(category)) {
    return <PlayfulBirthdayTemplate template={template} data={data} isView={isView} />;
  }

  return <DefaultTemplate template={template} data={data} isView={isView} />;
}
