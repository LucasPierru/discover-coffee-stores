import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Image from 'next/image';

import Banner from '../components/banner';
import Card from '../components/card';

import useTrackLocation from '../hooks/use-track-location';
import { fetchCoffeeStores } from '../lib/coffee-stores';
import { useEffect, useState, useContext } from 'react';
import { ACTION_TYPES, StoreContext } from '../store/store-context';

export async function getStaticProps(context) { //Meant for Api calls to download the data in advance 
  const coffeeStores = await fetchCoffeeStores();
  
  return {
    props: {
      coffeeStores,
    },
  }
}

export default function Home(props) {
  const { state, dispatch } = useContext(StoreContext);
  const { latLong, coffeeStores } = state
  const [coffeeStoresError, setCoffeeStoresError] = useState(null);
  const { handleTrackLocation, locationErrorMsg, isFindingLocation } = useTrackLocation();

  useEffect(() => {
    const setCoffeeStoresBylocation = async() => {
      if(latLong) {
        try {
          const response = await fetch(`/api/getCoffeeStoresByLocation?latLong=${latLong}&limit=${30}`)
          const fetchedCoffeeStores = await response.json()
          console.log('fetched coffee stores', fetchedCoffeeStores);
          // set coffee stores
          dispatch({
            type: ACTION_TYPES.SET_COFFEE_STORES,
            payload: { coffeeStores: fetchedCoffeeStores }
          })
          setCoffeeStoresError('');
        } catch (error) {
          //set error
          console.log({error});
          setCoffeeStoresError(error.message);
        }
      }
    }
    setCoffeeStoresBylocation();
  }, [dispatch, latLong])

  const handleOnBannerBtnClick = () => {
    console.log('banner button');
    handleTrackLocation();
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Coffee Connoisseur</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Banner 
          buttonText={isFindingLocation ? "Locating..." : "View stores nearby"} 
          handleOnClick={handleOnBannerBtnClick}
        />
        {locationErrorMsg && <p>Something went wrong: {locationErrorMsg}</p>}
        {coffeeStoresError && <p>Something went wrong: {coffeeStoresError}</p>}
        <div className={styles.heroImage}>
          <Image src="/static/hero-image.png" width={700} height={400} alt="hero-image"/>
        </div>
        {coffeeStores.length > 0 && (
        <div className={styles.sectionWrapper}>
          <h2 className={styles.heading2}>Stores near me</h2>
          <div className={styles.cardLayout}>
            {
              coffeeStores.map(coffeeStore => {
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
        </div>)}
        {props.coffeeStores.length > 0 && (
        <div className={styles.sectionWrapper}>
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
        </div>)}
      </main>
    </div>
  )
}
