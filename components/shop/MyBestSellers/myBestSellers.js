import React, { Fragment } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
//import MyBestSellersCard from './MyBestSellersCard/MyBestSellersCard';
import CardActionArea from "@material-ui/core/CardActionArea";
import CardMedia from "@material-ui/core/CardMedia";
import {FavoriteBorderOutlined, PermContactCalendar, StarRate} from "@material-ui/icons";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Fab from "@material-ui/core/Fab";
import Card from "@material-ui/core/Card";
import axios from 'axios';
import moment from 'moment';

moment.locale('fr');
const url = "https://myalfred.hausdivision.com/";

const styles = theme => ({
  container: {
    paddingRight: 15,
    paddingLeft: 15,
    marginRight: 'auto',
    marginLeft: 'auto',
    width: '100%',

    // Full width for (xs, extra-small: 0px or larger) and (sm, small: 600px or larger)
    [theme.breakpoints.up('md')]: { // medium: 960px or larger
      width: 920,
    },
    [theme.breakpoints.up('lg')]: { // large: 1280px or larger
      width: 1170,
    },
    [theme.breakpoints.up('xl')]: { // extra-large: 1920px or larger
      width: 1366,
    },
  },
  title: {
    fontSize: '2.5em',
    marginTop: '2rem',
    marginBottom: '2rem',
  },
  card2: {
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.down('md')]: { // medium: 960px or larger
      justifyContent: 'normal',
    },
  },
  card3: {
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: { // medium: 960px or larger
      justifyContent: 'normal',
    },
  },
  card: {
    maxWidth: 300,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 10,
  },
  gridContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  gridButton: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 10,
  },
  bookButton: {
    padding: '0 3rem !important',
  },
  media: {
    height: 200,
  },
  gpsText: {
    lineHeight: 2,
  },
  text: {
    paddingTop: '.7rem',
  },
  whiteLogo: {
    margin: '.5rem',
    color: 'white',
  },
  avatarContainer: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  avatar: {
    alignContent: 'start',
    justifySelf: 'center',
    height: 60,
    width: 60,
  },
  darkOverlay: {
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  locationGrid: {
    display: 'flex',
    justifyContent: 'center',
  },
  locationLogo: {
    color: 'white',
    marginLeft: 10,
  },
  locationText: {
    color: 'white',
    lineHeight: 2.3,
  },
  locationAvatarGrid: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
  },
  rowLocation: {
    display: 'flex',
    flexDirection: 'row',
    margin: '5px 20px 0 0',
  },
});

class myBestSellers extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      booking: [],
      shop: []
    }
  }

  componentDidMount() {
    let self = this;



    const id = self.props.shop;

    axios.get(`${url}myAlfred/api/shop/${id}`)
        .then(function (response) {

          let shop = response.data;
          let idAlfred = shop.alfred._id;


          axios.get(`${url}myAlfred/api/booking/last/5cc05ea97283fc59b4f498ff`)
              .then(function (result) {
                let booking = result.data;

                self.setState({booking: booking})
              })
              .catch(function (err) {
                console.log(err);
              })




        })
        .catch(function (error) {
          console.log(error);
        });
  }

  render() {
    const {classes} = this.props;
    const {booking} = this.state;
    const card =booking.map(e =>(<Grid item xs={12} sm={6} md={4}> <Card className={classes.card} key={e._id}>
      <CardActionArea>
        <CardMedia className={classes.media} image={"../../../static/photo-1538342014732-212dc8f76863.jpeg"} title="Coiffure">
          <div className={classes.darkOverlay}>
            <Grid container className={classes.avatarContainer}>
              <Grid container className={classes.gridContainer}>
                <PermContactCalendar className={classes.whiteLogo} />
                <FavoriteBorderOutlined className={classes.whiteLogo} />
              </Grid>
            </Grid>
          </div>
        </CardMedia>
        <CardContent>
          <Typography variant="h6" component="h2">
            {e.prestation.service.label}
          </Typography>
          <Grid container>
            <Typography variant="body2" component="p">
              Par {e.alfred.firstname}
            </Typography>
            <div>
              {moment(e.date_prestation.end).format('L')}
            </div>
          </Grid>
          <Typography component="p" className={classes.text}>
            {e.prestation.label}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Grid container className={classes.gridButton}>
          <Fab variant="extended" size="medium" color="primary" className={classes.bookButton}>
            Réservez
          </Fab>
        </Grid>
      </CardActions>
    </Card></Grid>));

    return (
        <Fragment>
          <Grid container className={classes.container}>
            <Typography variant="h5" className={classes.title}>Mes dernières prestations</Typography>
          </Grid>
          <Grid container className={classes.container} spacing={24}>

              {card}


          </Grid>
        </Fragment>
    );
  }
}

export default withStyles(styles)(myBestSellers);
