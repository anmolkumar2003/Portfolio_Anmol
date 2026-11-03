import { Crop, Images, Printer, RotateCw, SlidersHorizontal } from 'lucide-react';
import photoCity from '@assets/screen/photo-city.webp';
import photoCoast from '@assets/screen/photo-coast.webp';
import photoMountain from '@assets/screen/photo-mountain.webp';
import photoPrint from '@assets/screen/photo-print.webp';
import photoWildflower from '@assets/screen/photo-wildflower.webp';
import styles from './PhotoPrintScreen.module.scss';

const thumbs = [photoCoast, photoCity, photoWildflower, photoMountain] as const;
const collage = [photoCity, photoWildflower, photoMountain, photoCoast] as const;

export function PhotoPrintScreen() {
  return (
    <div className={styles.ui} aria-hidden="true">
      <div className={styles.appBar}>
        <span className={styles.mark} />
        <span>Print Studio</span>
      </div>

      <div className={styles.toolbar}>
        <span className={`${styles.tool} ${styles.activeTool}`}>
          <Crop className={styles.icon} />
          Crop
        </span>
        <span className={styles.tool}>
          <RotateCw className={styles.icon} />
          Rotate
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

      <div className={styles.canvas}>
        <img className={styles.heroPhoto} src={photoCoast} alt="" />
        <div className={styles.crop}>
          <span className={`${styles.handle} ${styles.tl}`} />
          <span className={`${styles.handle} ${styles.tr}`} />
          <span className={`${styles.handle} ${styles.bl}`} />
          <span className={`${styles.handle} ${styles.br}`} />
        </div>
      </div>

      <div className={styles.thumbs}>
        {thumbs.map((src, index) => (
          <img
            key={src}
            className={index === 0 ? styles.thumbActive : styles.thumb}
            src={src}
            alt=""
          />
        ))}
      </div>

      <div className={styles.row}>
        <div className={styles.collage}>
          {collage.map((src) => (
            <img key={src} src={src} alt="" />
          ))}
        </div>
        <div className={styles.printCard}>
          <img src={photoPrint} alt="" />
          <span>Print preview</span>
        </div>
      </div>

      <div className={styles.progress}>
        <div className={styles.progressMeta}>
          <Printer className={styles.icon} />
          <span>Printing photo</span>
        </div>
        <div className={styles.track}>
          <span className={styles.bar} />
        </div>
      </div>

      <div className={styles.dock}>
        <span className={styles.dockItem}>
          <Images className={styles.icon} />
          Gallery
        </span>
        <span className={`${styles.dockItem} ${styles.dockActive}`}>
          <Crop className={styles.icon} />
          Edit
        </span>
        <span className={styles.dockItem}>
          <Printer className={styles.icon} />
          Print
        </span>
      </div>
    </div>
  );
}
