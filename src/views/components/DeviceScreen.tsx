import {
  Bluetooth,
  Crop,
  Images,
  LayoutGrid,
  Printer,
  Search,
  SlidersHorizontal,
  Wifi,
} from 'lucide-react';
import photoCity from '@assets/screen/photo-city.jpg';
import photoCoast from '@assets/screen/photo-coast.jpg';
import photoMountain from '@assets/screen/photo-mountain.jpg';
import photoPasta from '@assets/screen/photo-pasta.jpg';
import photoPrint from '@assets/screen/photo-print.jpg';
import photoRecipe from '@assets/screen/photo-recipe.jpg';
import photoWildflower from '@assets/screen/photo-wildflower.jpg';
import { PhotoPrintScreen } from './PhotoPrintScreen';
import styles from './DeviceScreen.module.scss';

export type DeviceScreenVariant =
  | 'hero'
  | 'hp-sprocket'
  | 'kodak-step-prints'
  | 'lifeprint'
  | 'sprocket-sense'
  | 'spice-vibe';

interface DeviceScreenProps {
  variant?: string;
}

function HpSprocketScreen() {
  return (
    <div className={`${styles.ui} ${styles.hp}`} aria-hidden="true">
      <div className={styles.appBar}>
        <span>Sprocket</span>
        <span className={styles.statusPill}>
          <Bluetooth className={styles.icon} />
          Connected
        </span>
      </div>
      <div className={styles.heroFrame}>
        <img src={photoPrint} alt="" />
        <span className={styles.badge}>Ready to print</span>
      </div>
      <div className={styles.toolbar}>
        <span className={`${styles.tool} ${styles.activeTool}`}>
          <Crop className={styles.icon} />
          Crop
        </span>
        <span className={styles.tool}>
          <SlidersHorizontal className={styles.icon} />
          Adjust
        </span>
        <span className={styles.tool}>
          <Printer className={styles.icon} />
          Print
        </span>
      </div>
      <div className={styles.progress}>
        <span>Sending to printer</span>
        <div className={styles.track}>
          <span className={styles.bar} />
        </div>
      </div>
      <div className={styles.thumbs}>
        <img className={styles.thumbActive} src={photoPrint} alt="" />
        <img src={photoCoast} alt="" />
        <img src={photoCity} alt="" />
      </div>
    </div>
  );
}

function KodakStepScreen() {
  return (
    <div className={`${styles.ui} ${styles.kodak}`} aria-hidden="true">
      <div className={styles.appBar}>
        <span>Step Prints</span>
        <span className={styles.statusPill}>Theme on</span>
      </div>
      <div className={styles.gridFour}>
        <img className={styles.selected} src={photoWildflower} alt="" />
        <img src={photoCoast} alt="" />
        <img src={photoMountain} alt="" />
        <img src={photoCity} alt="" />
      </div>
      <div className={styles.chipRow}>
        <span className={styles.chipActive}>Single</span>
        <span className={styles.chip}>Strip</span>
        <span className={styles.chip}>Grid</span>
      </div>
      <div className={styles.paperPreview}>
        <img src={photoWildflower} alt="" />
        <span>Paper preview</span>
      </div>
      <div className={styles.dock}>
        <span>Photos</span>
        <span className={styles.dockActive}>Layout</span>
        <span>Print</span>
      </div>
    </div>
  );
}

function LifePrintScreen() {
  return (
    <div className={`${styles.ui} ${styles.life}`} aria-hidden="true">
      <div className={styles.tabs}>
        <span>Photos</span>
        <span className={styles.tabActive}>Edit</span>
        <span>Print</span>
      </div>
      <div className={styles.canvas}>
        <img src={photoCity} alt="" />
        <div className={styles.cropBox}>
          <span className={`${styles.handle} ${styles.tl}`} />
          <span className={`${styles.handle} ${styles.tr}`} />
          <span className={`${styles.handle} ${styles.bl}`} />
          <span className={`${styles.handle} ${styles.br}`} />
        </div>
      </div>
      <div className={styles.sliderRow}>
        <span />
        <span className={styles.sliderFill} />
      </div>
      <div className={styles.chipRow}>
        <span className={styles.chipActive}>Crop</span>
        <span className={styles.chip}>Square</span>
        <span className={styles.chip}>Story</span>
      </div>
      <div className={styles.printRow}>
        <img src={photoCity} alt="" />
        <div>
          <strong>Print preview</strong>
          <span>2 × 3 layout</span>
        </div>
      </div>
    </div>
  );
}

function SprocketSenseScreen() {
  return (
    <div className={`${styles.ui} ${styles.sense}`} aria-hidden="true">
      <div className={styles.appBar}>
        <span>Sense</span>
        <span className={styles.statusPill}>
          <Wifi className={styles.icon} />
          Wi-Fi
        </span>
      </div>
      <div className={styles.gridSix}>
        <img src={photoMountain} alt="" />
        <img src={photoCoast} alt="" />
        <img className={styles.selected} src={photoWildflower} alt="" />
        <img src={photoCity} alt="" />
        <img src={photoPrint} alt="" />
        <span className={styles.collageTile}>
          <LayoutGrid className={styles.icon} />
          Collage
        </span>
      </div>
      <div className={styles.actionCard}>
        <Printer className={styles.icon} />
        <div>
          <strong>Send to printer</strong>
          <span>Precut · Photo ID · Booth</span>
        </div>
      </div>
      <div className={styles.dock}>
        <span className={styles.dockActive}>
          <Images className={styles.icon} />
          Gallery
        </span>
        <span>Create</span>
        <span>Print</span>
      </div>
    </div>
  );
}

function SpiceVibeScreen() {
  return (
    <div className={`${styles.ui} ${styles.spice}`} aria-hidden="true">
      <div className={styles.search}>
        <Search className={styles.icon} />
        <span>Search recipes</span>
      </div>
      <div className={styles.chipRow}>
        <span className={styles.chipActive}>Popular</span>
        <span className={styles.chip}>Curry</span>
        <span className={styles.chip}>Pasta</span>
      </div>
      <div className={styles.featureCard}>
        <img src={photoRecipe} alt="" />
        <div>
          <strong>Butter chicken</strong>
          <span>35 min · Dinner</span>
        </div>
      </div>
      <div className={styles.recipeList}>
        <img src={photoPasta} alt="" />
        <div>
          <strong>Tomato basil pasta</strong>
          <span>Ingredients · 4 steps</span>
        </div>
      </div>
      <div className={styles.dock}>
        <span className={styles.dockActive}>Home</span>
        <span>Saved</span>
        <span>Cart</span>
      </div>
    </div>
  );
}

export function DeviceScreen({ variant = 'hero' }: DeviceScreenProps) {
  switch (variant) {
    case 'hp-sprocket':
      return <HpSprocketScreen />;
    case 'kodak-step-prints':
      return <KodakStepScreen />;
    case 'lifeprint':
      return <LifePrintScreen />;
    case 'sprocket-sense':
      return <SprocketSenseScreen />;
    case 'spice-vibe':
      return <SpiceVibeScreen />;
    default:
      return <PhotoPrintScreen />;
  }
}
