import React, { Fragment } from 'react';
import Navbar from '../components/home/Navbar/Navbar';
import PopularCategories from '../components/home/PopularCategories/PopularCategories';
import SerenityNeed from '../components/home/SerenityNeed/SerenityNeed';
import BecomeAlfred from '../components/home/BecomeAlfred/BecomeAlfred';
import Recommandations from '../components/home/Recommandations/Recommandations';
import TemptedBy from '../components/home/TemptedBy/TemptedBy';
import NearbyYou from '../components/home/NearbyYou/NearbyYou';
import Homeheader from '../components/home/Homeheader/Homeheader';

const Home = () => (
  <Fragment>
    <Navbar />
    <Homeheader />
    <PopularCategories />
    <SerenityNeed />
    <BecomeAlfred />
    <TemptedBy />
    <NearbyYou />
  </Fragment>
);

export default Home;
