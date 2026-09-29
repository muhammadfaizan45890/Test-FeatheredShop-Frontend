import Hero from '@/components/Hero'
// import Middle from '@/components/Middle'
import Footer from '@/components/Footer'
import React from 'react'
import Category from './Category'
import Poster from '@/components/Poster'

const Home = () => {
  return (
    <div>
      <Hero/>
            <Category/>
            <Poster/>

      {/* <Middle/> */}
      <Footer/>
    </div>
  )
}

export default Home
