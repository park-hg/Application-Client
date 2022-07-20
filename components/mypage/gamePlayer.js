import Image from 'next/image';
import styles from '../../styles/pages/mypage.module.scss';

export default function GamePlayer({ info, onClickPlayer, myInfo=null }) {
  return (
    <div className={styles.gameHistoryPlayerItem}>
      <div className={styles.gameHistoryPlayerProfileImage}>
        <Image src={myInfo ? myInfo.avatarUrl : info.avatarUrl} width={20} height={20} alt="profile" className={styles.gameHistoryPlayerProfileImage} />
      </div>
      <div className={styles.gameHistoryPlayerInfoBox}>
        <div className={styles.gameHistoryPlayerNickname}>{myInfo ? myInfo.gitId : info.gitId}</div>
        <div className={styles.gameHistoryPlayerPassRate}>{`✅ ${info.passRate}%`}</div>
        <div className={styles.gameHistoryPlayerLanguage} onClick={onClickPlayer}>{info.language}</div>
      </div>
    </div>
  )
}