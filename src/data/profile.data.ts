import type { Profile } from '@models';

export const profileData: Profile = {
  name: 'Anmol Kumar',
  role: 'Mobile Application Developer (iOS & Flutter)',
  shortRole: 'Mobile Application Developer',
  headline: 'I build iOS and Flutter apps.',
  description:
    "I'm Anmol Kumar, a mobile developer in Mohali. I work on native iOS and Flutter, mostly on photo printing apps, UI, and connecting phones to printers.",
  location: 'Mohali, Punjab, India',
  email: 'anmol.ios58@gmail.com',
  phone: '+91 8054205658',
  availability: 'Open to opportunities',
  techLabels: ['Swift', 'SwiftUI', 'Flutter', 'Dart'],
  resumeUrl: null,
  social: {
    github: 'https://github.com/anmolkumar2003',
    linkedin: 'https://linkedin.com/in/anmol-kumar-81a3b7216',
  },
  about: {
    paragraphs: [
      'I work on iOS and Flutter apps from Mohali, Punjab. Day to day that means Swift, UIKit and SwiftUI, and Flutter when a product needs to run on more than one platform.',
      'I keep screens and business logic separate with MVVM, talk to REST APIs and Firebase when an app needs a backend, and spend a lot of time debugging how things behave on a real device.',
      'A fair amount of my recent work is printer-related: Bluetooth, Wi-Fi, and the UI around connecting a phone to a printer and sending a photo.',
    ],
    focusAreas: [
      'Native iOS',
      'Swift, UIKit, SwiftUI',
      'Flutter and Dart',
      'MVVM',
      'REST APIs and Firebase',
      'Printer connectivity',
    ],
  },
};
