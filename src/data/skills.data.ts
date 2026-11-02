import type { Skill, SkillGroup } from '@models';

const skill = (
  category: Skill['category'],
  name: string,
): Skill => ({
  id: `${category}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name,
  category,
});

export const skillGroupsData: readonly SkillGroup[] = [
  {
    id: 'native-ios',
    title: 'iOS Development',
    skills: [
      skill('native-ios', 'Swift'),
      skill('native-ios', 'UIKit'),
      skill('native-ios', 'SwiftUI'),
    ],
  },
  {
    id: 'cross-platform',
    title: 'Cross-platform Development',
    skills: [
      skill('cross-platform', 'Flutter'),
      skill('cross-platform', 'Dart'),
    ],
  },
  {
    id: 'architecture',
    title: 'Architecture and Development',
    skills: [
      skill('architecture', 'MVVM'),
      skill('architecture', 'REST API integration'),
      skill('architecture', 'Mobile application debugging'),
      skill('architecture', 'Performance optimization'),
    ],
  },
  {
    id: 'backend',
    title: 'Backend and Integrations',
    skills: [
      skill('backend', 'Firebase'),
      skill('backend', 'Firebase Storage'),
      skill('backend', 'Google Sign-In'),
      skill('backend', 'Social authentication'),
      skill('backend', 'Bluetooth and printer connectivity'),
      skill('backend', 'Wi-Fi printer integration'),
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    skills: [
      skill('tools', 'Xcode'),
      skill('tools', 'Android Studio'),
      skill('tools', 'Git'),
      skill('tools', 'GitLab'),
      skill('tools', 'CocoaPods'),
    ],
  },
];
