import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Image from 'next/image';

import Banner from '../components/banner';
import Card from '../components/card';

import coffeeStoresData from '../data/coffee-stores.json';
import { fetchCoffeeStores } from '../lib/coffee-stores';

export async function getStaticProps(context) { //Meant for Api calls to download the data in advance 
  const coffeeStores = await fetchCoffeeStores();
  
  return {
    props: {
      coffeeStores,
    },
  }
}

export default function Home(props) {
  const handleOnBannerBtnClick = () => {
    console.log('banner button');
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>Coffee Connoisseur</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Banner buttonText="View stores nearby" handleOnClick={handleOnBannerBtnClick}/>
        <div className={styles.heroImage}>
          <Image src="/static/hero-image.png" width={700} height={400} alt="hero-image"/>
        </div>
        {props.coffeeStores.length > 0 && (
        <>
          <h2 className={styles.heading2}>Montréal Stores</h2>
          <div className={styles.cardLayout}>
            {
              props.coffeeStores.map(coffeeStore => {
                return (
                  <Card 
                    key={coffeeStore.id}
                    name={coffeeStore.name}
                    imgUrl={coffeeStore.imgUrl || "https://images.unsplash.com/photo-1498804103079-a6351b050096?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2468&q=80"}
                    href={`/coffee-store/${coffeeStore.id}`}
                    className={styles.card}
                  />
                );
              })
            }
          </div> 
        </>)}
      </main>
    </div>
  )
}
