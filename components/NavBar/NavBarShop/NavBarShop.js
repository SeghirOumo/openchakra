import Grid from '@material-ui/core/Grid';
import Link from 'next/link';
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import styles from './NavBarShopStyle'

class NavBarShop extends React.Component{
  constructor(props){
    super(props)
  }
  render(){
    const {classes} = this.props;
    return (
      <Grid container className={classes.topbar} justify="center" style={{backgroundColor: '#4fbdd7',marginTop: -3}}>

        <Grid item xs={2} style={{textAlign:"center",borderBottom: '2px solid white'}}>
          <Link href={'/myShop/services'}><a style={{textDecoration:'none'}}>
            <p style={{color: "white",cursor: 'pointer'}}>Ma boutique</p></a>
          </Link>
        </Grid>
        <Grid item xs={2} style={{textAlign:"center"}}>
          <Link href={'/myShop/messages'}><a style={{textDecoration:'none'}}>
            <p style={{color: "white",cursor: 'pointer'}}>Messages</p></a>
          </Link>
        </Grid>
        <Grid item xs={2} style={{textAlign:"center"}}>
          <Link href={'/myShop/mesreservations'}><a style={{textDecoration:'none'}}>
            <p style={{color: "white",cursor: 'pointer'}}>Mes réservations</p></a>
          </Link>
        </Grid>
        <Grid item xs={2} style={{textAlign:"center",zIndex:999}}>
          <Link href={'/myShop/myAvailabilities'}><a style={{textDecoration:'none'}}>
            <p style={{color: "white",cursor: 'pointer'}}>Mon calendrier</p></a>
          </Link>
        </Grid>
        <Grid item xs={2} style={{textAlign:"center"}}>
          <Link href={'/myShop/performances'}><a style={{textDecoration:'none'}}>
            <p style={{color: "white",cursor: 'pointer'}}>Performance</p></a>
          </Link>
        </Grid>
      </Grid>
    )
  }
}

NavBarShop.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default  withStyles(styles, { withTheme: true })(NavBarShop);
