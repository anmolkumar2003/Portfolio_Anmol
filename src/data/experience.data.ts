import type { Experience } from '@models';

/** Newest first — internship and junior roles stay as separate entries. */
export const experienceData: readonly Experience[] = [
  {
    id: 'caplus-junior',
    organization: 'CAPLUS TECH',
    kind: 'employment',
    location: 'Mohali, Punjab, India',
    startDate: '2024-04',
    endDate: null,
    currentTitle: 'Junior iOS Developer',
    roles: [
      {
        title: 'Junior iOS Developer',
        startDate: '2024-04',
        endDate: null,
      },
    ],
  },
  {
    id: 'caplus-intern',
    organization: 'CAPLUS TECH',
    kind: 'employment',
    location: 'Mohali, Punjab, India',
    startDate: '2024-01',
    endDate: '2024-03',
    currentTitle: 'iOS Developer Intern',
    roles: [
      {
        title: 'iOS Developer Intern',
        startDate: '2024-01',
        endDate: '2024-03',
      },
    ],
  },
  {
    id: 'cs-soft-solutions',
    organization: 'CS Soft Solutions',
    kind: 'training',
    location: 'Mohali, Punjab',
    startDate: '2023-07',
    endDate: '2023-12',
    currentTitle: 'iOS Developer Training',
    roles: [
      {
        title: 'iOS Developer Training',
        startDate: '2023-07',
        endDate: '2023-12',
      },
    ],
  },
];
