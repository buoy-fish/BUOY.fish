// Select options for the /propose form, shared by the page (to render them)
// and the action (to validate the submitted value). The `value` is what's stored
// in the app.buoy.fish lead's details (ADR-0039), so treat values as a stored
// enum: add new ones freely, but don't rename existing ones.
export type ProposalOption = { value: string; label: string }

export const FUNDING_OPTIONS: ProposalOption[] = [
  { value: "not_funded", label: "Not funded yet" },
  { value: "applying", label: "Applying for a grant or program" },
  { value: "funded_under_10k", label: "Funded, under $10,000" },
  { value: "funded_10k_50k", label: "Funded, $10,000 to $50,000" },
  { value: "funded_over_50k", label: "Funded, over $50,000" },
  { value: "unsure", label: "Not sure" },
]

export const TIMELINE_OPTIONS: ProposalOption[] = [
  { value: "under_3_months", label: "Within 3 months" },
  { value: "3_6_months", label: "In 3 to 6 months" },
  { value: "6_12_months", label: "In 6 to 12 months" },
  { value: "over_12_months", label: "More than a year out" },
  { value: "exploring", label: "Just exploring" },
]
