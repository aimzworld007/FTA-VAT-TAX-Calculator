export const STEP_ORDER = ['business-details', 'input', 'preview', 'export'] as const;
export type ModuleStep = (typeof STEP_ORDER)[number];
export const stepIndex = (step: string) => STEP_ORDER.indexOf(step as ModuleStep);
