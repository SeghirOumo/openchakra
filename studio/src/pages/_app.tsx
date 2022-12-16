import React from 'react'
import 'react-color-picker/index.css'
import '@reach/combobox/styles.css' // USELESS with NativeBase ?

import { wrapper } from '~core/store'
import { ErrorBoundary as BugsnagErrorBoundary } from '~utils/bugsnag'
import AppErrorBoundary from '~components/errorBoundaries/AppErrorBoundary'
import { AppProps } from 'next/app'
import Fonts from '~dependencies/theme/Fonts'
import { NativeBaseProvider } from "native-base";


const Main = ({ Component, pageProps }: AppProps) => (
  <NativeBaseProvider isSSR>
    <BugsnagErrorBoundary>
      <Fonts />
      <AppErrorBoundary>
        <Component {...pageProps} />
      </AppErrorBoundary>
    </BugsnagErrorBoundary>
  </NativeBaseProvider>
)

export default wrapper.withRedux(Main)
