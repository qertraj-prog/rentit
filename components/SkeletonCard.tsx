import styles from './SkeletonCard.module.css'

export default function SkeletonCard() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={`skeleton ${styles.image}`} />
      <div className={styles.body}>
        <div className={styles.priceRow}>
          <div className={`skeleton ${styles.price}`} />
          <div className={`skeleton ${styles.badge}`} />
        </div>
        <div className={`skeleton ${styles.title}`} />
        <div className={`skeleton ${styles.titleShort}`} />
        <div className={`skeleton ${styles.location}`} />
        <div className={styles.amenities}>
          <div className={`skeleton ${styles.amenityChip}`} />
          <div className={`skeleton ${styles.amenityChip}`} />
          <div className={`skeleton ${styles.amenityChip}`} />
        </div>
        <div className={styles.footer}>
          <div className={`skeleton ${styles.deposit}`} />
          <div className={`skeleton ${styles.btn}`} />
        </div>
      </div>
    </div>
  )
}
