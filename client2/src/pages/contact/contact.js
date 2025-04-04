import React from 'react'
import TopHeader from '../../components/topHeader/TopHeader'
import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'

const Contact = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopHeader />
      <Header />
      {/*Main Content*/}
      <div className="flex-grow">
      </div>
      <Footer/>
    </div>
  )
}

export default Contact
