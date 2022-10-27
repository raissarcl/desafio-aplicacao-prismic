import { AppProps } from 'next/app';
import Link from 'next/link'
import { PrismicProvider } from '@prismicio/react';
import { PrismicPreview } from '@prismicio/next'
import { repositoryName } from '../../prismicio';
import '../styles/globals.scss';
import Header from '../components/Header';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PrismicProvider
      internalLinkComponent={({ href, ...props }) => (
        <Link href={href}>
          <a {...props} />
        </Link>
      )}
    >
      <PrismicPreview repositoryName={repositoryName}>
        <Header />
        <Component {...pageProps} />
      </PrismicPreview>
    </PrismicProvider>
  )
}
