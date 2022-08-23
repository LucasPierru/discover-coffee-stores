import { useRouter } from 'next/router';
import Link from 'next/link';

import coffeeStoresData from '../../data/coffee-stores.json'

export function getStaticProps({params}) {
  console.log(params)
  return {
    props: {
      coffeeStore: coffeeStoresData.find(coffeeStore => coffeeStore.id.toString() === params.id), //dynamic id
    },
  }
}

export async function getStaticPaths() { // Meant for dynamic routes
  return {
    paths: [
      { params : {id: '0'}},
      { params : {id: '1'}},
    ],
    fallback: true,
  };
}

const CoffeeStore = (props) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>
  }

  return (
    <div>
      Coffee Store Page {router.query.id}
      <Link href="/">
        <a>Back to home</a>
      </Link>
      <Link href="/coffee-store/dynamic">
        <a>Go to page dynamic</a>
      </Link>
      <p>{props.coffeeStore?.address}</p>
      <p>{props.coffeeStore?.name}</p>
    </div>
  )
}

export default CoffeeStore;