import Head from 'next/head';

import HomePage from './home/index.page';

/**
 *
 * @returns Landing page
 */
export default function LandingPage() {
  return (
    <>
      <Head>
        <title>NFT Maker App</title>
      </Head>
      {/*Import contacts*/}
      <HomePage />
    </>
  );
}
