import {WebView} from 'react-native-webview';
import React, { useRef, useState, useEffect } from 'react'
import {
    SafeAreaView,
    StyleSheet,
    Text,
    Button,
    NativeModules
} from 'react-native';
//import SplashScreen from 'react-native-splash-screen';
import axios from 'axios'
const {WithingsLink} = NativeModules;

const App = () => {

  const [currentUrl, setCurrentUrl]=useState('')
  const [displaySetup, setDisplaySetup]=useState(false)
  const [currentUser, setCurrentUser]=useState(null)

  const webviewRef = useRef(null);

  useEffect(()=> {
    setDisplaySetup(/setup-appareil/.test(currentUrl))
  }, [currentUrl])

  useEffect(()=> {
    axios.get('https://dekuple.my-alfred.io/myAlfred/api/studio/current-user')
      .then(res => {
        setCurrentUser(res.data)
      })
      .catch(err => {
        //console.error(`Can not get current-user:${err}`)
      })
    setDisplaySetup(/setup-appareil/.test(currentUrl))
  }, [currentUrl])

  const accessToken=currentUser?.access_token
  const csrfToken=currentUser?.csrf_token
  WithingsLink.sayHello()
  return (
    <>
      <SafeAreaView style={styles.flexContainer}  >
        <WebView
          startInLoadingState={true}
          allowsBackForwardNavigationGestures
          mediaPlaybackRequiresUserAction={true}
          //source={{ uri: "https://dekuple.my-alfred.io/setup-appareils" }}
          source={{ uri: "https://dekuple.my-alfred.io" }}
          ref={webviewRef}
          onNavigationStateChange={({url}) => setCurrentUrl(url)}
        />
        { (displaySetup || true) && currentUser &&
          <>
            <Button title="open install" onPress={
              ()=>WithingsLink.openInstall(accessToken, csrfToken)
            }/>
            <Button title="open settings" onPress={
              ()=>WithingsLink.openSettings(accessToken, csrfToken)
            }/>
          </>
        }
        </SafeAreaView>
    </>
  )
};

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1
    },
});

export default App
