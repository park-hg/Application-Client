import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import logout from '../../lib/logout';
import Layout from '../../components/layouts/main';
import Header from '../../components/header';
import { MyInfoBox } from '../../components/mypage/myInfo';
import RankingBox from '../../components/mypage/ranking';
import GameHistory from '../../components/mypage/gameHistory';
import Loading from '../../components/loading';
import styles from '../../styles/pages/mypage.module.scss'

export default function MyPage() {
  const router = useRouter();
  const { data, status } = useSession();
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [myInfo, setMyInfo] = useState({});
  const [gameLogs, setGameLogs] = useState([]);
  const [teamGameLogs, setTeamGameLogs] = useState([]);
  const [soloGameLogs, setSoloGameLogs] = useState([]);

  useEffect(() => {
    if(isLogin) {
      getUserInfo();
    }
  }, [isLogin]);

  useEffect(() => {
    if(status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status]);

  const getUserInfo = async () => {
    await fetch(`/server/api/user/info?id=getmyinformation`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(res => {
      if(res.status === 401) {
        router.replace({
          pathname: '/',
          query: { msg: 'loginTimeout' }
        });
        return;
      }
      return res.json();
    })
    .then(data => {
      if(data.success) {
        setMyInfo(data.UserInfo);
        setGameLogs(data.UserInfo.gameLogHistory.reverse());
        setSoloGameLogs(data.UserInfo.soloGameLogHistory.reverse());
        setTeamGameLogs(data.UserInfo.teamGameLogHistory.reverse());
        setIsLoading(false);
      }
    })
    .catch(error => console.log('[/pages/mypage] getUserInfo error >> ', error));
  };

  return (
    <Layout
      header={
        <Header 
          label="로그아웃" 
          onClickBtn={logout} 
          checkValidUser={(isValidUser) => setIsLogin(isValidUser)} 
        />
      }
      body={
        <>
          {status !== 'authenticated' && isLoading && <Loading />}
          { 
            isLogin & !isLoading
            && <div className={styles.mainBox}>
                <div className={styles.mainCol}>
                  <MyInfoBox myInfo={myInfo} data={data} />
                  <RankingBox />
                </div>
                <GameHistory 
                  totalLogs={gameLogs} 
                  soloLogs={soloGameLogs}
                  teamLogs={teamGameLogs} 
                  winSolo={myInfo?.winSolo ?? 0}
                  winTeam={myInfo?.winTeam ?? 0}
                  totalSolo={myInfo?.totalSolo ?? 0}
                  totalTeam={myInfo?.totalTeam ?? 0}
                />
              </div>
          }
        </>
      }
    />
  )
}