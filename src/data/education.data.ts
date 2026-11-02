import type { Education } from '@models';

export const educationData: readonly Education[] = [
  {
    id: 'bca',
    institution: 'SVIET College',
    institutionStatus: 'confirmed',
    location: 'Banur, Punjab',
    credential: 'Bachelor of Computer Applications (BCA)',
    field: 'Computer Applications',
    startDate: '2021',
    endDate: '2024',
    status: 'completed',
  },
  {
    id: 'mca',
    institution: 'Lovely Professional University',
    institutionStatus: 'confirmed',
    location: 'Jalandhar, Punjab',
    credential: 'Master of Computer Applications (MCA)',
    field: 'Computer Applications',
    startDate: '2025',
    endDate: '2027',
    status: 'in-progress',
  },
];
