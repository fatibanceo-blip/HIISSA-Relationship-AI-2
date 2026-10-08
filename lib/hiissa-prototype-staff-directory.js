/**
 * HIISSA founder-approved fictional Staging prototype directory.
 * This is NOT a real employee account source, role assignment, or access grant.
 * Preserve stable prototype person IDs, roles, locales and timezones across previews.
 */
const SOURCE_DEPARTMENTS = Object.freeze([
  {
    id: "customer_support",
    label: "Customer Support",
    people: [
      { id: "demo-sarah", name: "Sarah Mensah", role: "Customer Support Specialist", locale: "en-GB", timeZone: "Europe/London" },
      { id: "demo-mary", name: "Mary Okafor", role: "Customer Support Specialist", locale: "en-GH", timeZone: "Africa/Accra" },
    ],
  },
  {
    id: "finance_subscriptions",
    label: "Finance & Subscriptions",
    people: [
      { id: "demo-john", name: "John Adeyemi", role: "Finance Specialist", locale: "en-GB", timeZone: "Europe/London" },
      { id: "demo-claire", name: "Claire Martin", role: "Subscriptions Specialist", locale: "fr-FR", timeZone: "Europe/Paris" },
    ],
  },
  {
    id: "technical_operations",
    label: "Technical Operations",
    people: [
      { id: "demo-amina", name: "Amina Diallo", role: "Technical Operations Specialist", locale: "fr-FR", timeZone: "Africa/Dakar" },
      { id: "demo-daniel", name: "Daniel Kim", role: "Technical Operations Specialist", locale: "en-SG", timeZone: "Asia/Singapore" },
    ],
  },
  {
    id: "safety_safeguarding",
    label: "Safety & Safeguarding",
    people: [
      { id: "demo-nadia", name: "Nadia Hassan", role: "Safeguarding Specialist", locale: "en-GB", timeZone: "Europe/London" },
    ],
  },
  {
    id: "privacy_data_protection",
    label: "Privacy & Data Protection",
    people: [
      { id: "demo-elena", name: "Elena Rossi", role: "Privacy Specialist", locale: "it-IT", timeZone: "Europe/Rome" },
    ],
  },
  {
    id: "content_moderation",
    label: "Content & Moderation",
    people: [
      { id: "demo-kwame", name: "Kwame Boateng", role: "Content Specialist", locale: "en-GH", timeZone: "Africa/Accra" },
    ],
  },
  {
    id: "product_quality",
    label: "Product & Quality",
    people: [
      { id: "demo-mei", name: "Mei Chen", role: "Product Quality Specialist", locale: "en-SG", timeZone: "Asia/Singapore" },
    ],
  },
]);

export const HIISSA_PROTOTYPE_STAFF_DEPARTMENTS = Object.freeze(
  SOURCE_DEPARTMENTS.map((department) => Object.freeze({
    ...department,
    people: Object.freeze(department.people.map((person) => Object.freeze({...person}))),
  }))
);

export const HIISSA_PROTOTYPE_STAFF = Object.freeze(
  HIISSA_PROTOTYPE_STAFF_DEPARTMENTS.flatMap((department) =>
    department.people.map((person) => Object.freeze({
      ...person,
      departmentId: department.id,
      departmentLabel: department.label,
    }))
  )
);
