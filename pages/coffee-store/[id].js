import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';

import useSWR from 'swr';

import cls from 'classnames';

import styles from '../../styles/coffee-store.module.css'
import { fetchCoffeeStores } from '../../lib/coffee-stores';

import { StoreContext } from '../../store/store-context';

import { isEmpty, fetcher } from '../../utils';

export async function getStaticProps({params}) {
  const coffeeStores = await fetchCoffeeStores();
  const findCoffeeStoreById = coffeeStores.find(coffeeStore => {
    return coffeeStore.id.toString() === params.id}
  );

  return {
    props: {
      coffeeStore: findCoffeeStoreById ? findCoffeeStoreById: {} //dynamic id
    },
  }
}

export async function getStaticPaths() { // Meant for dynamic routes
  const coffeeStores = await fetchCoffeeStores();
  const paths = coffeeStores.map(coffeeStore => {
    return {
      params: {
        id: coffeeStore.id.toString(),
      },
    }
  })

  return {
    paths,
    fallback: true,
  };
}

const CoffeeStore = (initialProps) => {
  const router = useRouter();
  
  const id = router.query.id;
  
  const [coffeeStore, setCoffeeStore] = useState(initialProps.coffeeStore || {});

  const { 
    state: { coffeeStores },
  } = useContext(StoreContext);
  
  const handleCreateCoffeeStore = async(coffeeStore) => {
    try {
      const { id, name, voting, imgUrl, neighborhood, address } = coffeeStore;
      const response = await fetch('/api/createCoffeeStore', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name,
          voting: 0,
          imgUrl,
          neighbourhood: neighborhood || "",
          address: address || ""
        }),
      });

      const dbCoffeeStore = await response.json()
      console.log({ dbCoffeeStore });
    } catch(error) {
      console.error('Error creating coffee store', error);
    }
  }

  useEffect(() => {
    if(isEmpty(initialProps.coffeeStore)) {
      if (coffeeStores.length > 0) {
        const coffeeStoreFromContext = coffeeStores.find(coffeeStore => {
          return coffeeStore.id.toString() === id;
        });
        setCoffeeStore(coffeeStoreFromContext);
        handleCreateCoffeeStore(coffeeStoreFromContext);
      }
    } else {
      //SSG
      handleCreateCoffeeStore(initialProps.coffeeStore);
    }
  }, [id, initialProps.coffeeStore, coffeeStores])

  const { address, neighborhood, name, imgUrl } = coffeeStore;

  const [votingCount, setVotingCount] = useState(1);

  const { data, error } = useSWR(`/api/getCoffeeStoreById?id=${id}`, fetcher);

  useEffect(() => {
    if(data && data.length > 0) {
      console.log('data from SWR', data);
      setCoffeeStore(data[0]);
      setVotingCount(data[0].voting);
    }
  }, [data])

  const handleUpvoteButton = () => {
    let count = votingCount + 1;
    setVotingCount(count);
  }

  if (router.isFallback) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Something went wrong retrieving coffee store page</div>
  }

  return (
    <div className={styles.layout}>
      <Head>
        <title>{name}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.col1}>
          <div className={styles.backToHomeLink}>
            <Link href="/">
              <a>← Back to home</a>
            </Link>
          </div>
          <div className={styles.nameWrapper}>
            <h1 className={styles.name}>{name}</h1>
          </div>
          <Image 
            src={imgUrl || "https://images.unsplash.com/photo-1498804103079-a6351b050096?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2468&q=80"} 
            width={600} 
            height={360} 
            className={styles.storeImg} 
            alt={name}
          />
        </div>
        <div className={cls("glass", styles.col2)}>
          { address && (
            <div className={styles.iconWrapper}>
              <Image src="/static/icons/places.svg" width="24" height="24" alt="address-icon"/>
              <p className={styles.text}>{address}</p>
            </div>  
          )}
          { neighborhood && (
            <div className={styles.iconWrapper}>
              <Image src="/static/icons/nearMe.svg" width="24" height="24" alt="neighbourhood-icon"/>
              <p className={styles.text}>{neighborhood}</p>
            </div>  
          )}
          <div className={styles.iconWrapper}>
            <Image src="/static/icons/star.svg" width="24" height="24" alt="upvote-icon"/>
            <p className={styles.text}>{votingCount}</p>
          </div>
          <button className={styles.upvoteButton} onClick={handleUpvoteButton}>Up Vote</button>
        </div>  
      </div>
    </div>
  );
}

export default CoffeeStore;