import path from 'path'

export const DATA_DIR = path.join(process.cwd(), 'data');
export const TESTRUNS_DIR  = path.join(DATA_DIR, 'test-runs');
export const ANALYSES_DIR = path.join(DATA_DIR, "triage-diagnoses");
