import { useLayoutEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image'
import { useSession, signIn, signOut } from 'next-auth/react';
import { hasCookie, getCookie, deleteCookie } from 'cookies-next';
import { socket } from '../lib/socket';
import Loading from './loading';
import styles from '../styles/components/header.module.scss';

export default function Header({ label="", onClickBtn=()=>{}, checkValidUser=()=>{}, isCustom=false, customHeader=null }) {
  const router = useRouter();
  const { data, status } = useSession();

  useLayoutEffect(() => {
    if(status === 'authenticated') {
      if(router.isReady) {
        // console.log('setting socket');
        // socket.auth.token = getCookie('jwt');
        // socket.connect();
        socket.emit('setGitId', router?.query?.mode, router?.query?.roomId);
        checkValidUser(true);
      } else if (data.accessToken) {
        sendAccessToken(data.accessToken);
      }
    } else if(status === 'unauthenticated') {
      deleteCookies();
    }
  }, [status, router.isReady]);

  const deleteCookies = () => {
    deleteCookie('jwt');
    deleteCookie('sidebar');
    checkValidUser(false);
  };

  const goToLobby = () => {
    router.replace('/');
  };

  const sendAccessToken = async(accessToken) => {
    await fetch(`/server/api/login`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken,
      },
      credentials: 'include'
    })
    .then(res => {
      console.log(res);
      console.log('setting socket here!');
      socket.connect();
      return res.json();
    })
    .then(data => {
      if(data.success) {
        if(router.isReady) {
          socket.emit('setGitId', router?.query?.mode, router?.query?.roomId);
          checkValidUser(true);
        }
      } else {
        deleteCookies();
        signOut();
      }
    })
    .catch(error => {
      console.log('[/components/header] get-info error >> ', error);
      deleteCookies();
      signOut();
    });
  };

  return (
    <>
      { status === 'loading' && <Loading /> }
      {
        isCustom
        ? customHeader
        : <>
            <div className={styles.headerRow}>
              <div className={styles.headerTitle} onClick={goToLobby}>{`{ CODE: '뚝딱' }`}</div>
            </div>
            <div className={styles.headerRow}>
            {
              status === 'authenticated'
              ? <div className={styles.myPageBtn} onClick={onClickBtn}>{label}</div>
              : <div className={styles.loginBtn}  onClick={() => signIn('github')}>
                  <Image src="/github.png" alt="github Logo" width={20} height={20} />
                  <div className={styles.loginText}>로그인</div>
                </div>
            }
            </div>
          </>
      }
    </>
  )
}