import type { Experience } from '@models';

export const experienceData: readonly Experience[] = [
  {
    id: 'caplus-tech',
    organization: 'CAPLUS TECH',
    kind: 'employment',
    location: 'Mohali, Punjab, India',
    startDate: '2024-01',
    endDate: null,
    currentTitle: 'Jr. iOS Developer',
    roles: [
      {
        title: 'iOS Intern',
        startDate: '2024-01',
        endDate: '2024-03',
      },
      {
        title: 'Jr. iOS Developer',
        startDate: '2024-01',
        endDate: null,
      },
    ],
  },
  {
    id: 'cs-soft-solutions',
    organization: 'CS Soft Solutions',
    kind: 'training',
    location: 'Mohali, Punjab',
    startDate: null,
    endDate: null,
    currentTitle: 'iOS Developer Trainee',
    roles: [
      {
        title: 'iOS Developer Trainee',
        startDate: null,
        endDate: null,
      },
    ],
  },
];
